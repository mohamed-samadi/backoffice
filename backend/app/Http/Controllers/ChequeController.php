<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Cheque;
use App\Models\Client;
use App\Http\Requests\StoreChequeRequest;
use App\Http\Requests\UpdateChequeRequest;

class ChequeController extends Controller
{
    /**
     * Liste paginée des chèques avec stats et filtres
     */
    public function index(Request $request): JsonResponse
    {
        // ─── Stats (1 requête) ────────────────────────────────────────────────
$stats = Cheque::selectRaw("
    count(*) as total,
    count(case when statut = 'non_encaisse' then 1 end) as non_encaisse,
    count(case when statut = 'encaisse'     then 1 end) as encaisse,
    count(case when statut = 'impaye'       then 1 end) as impaye,
    count(case when statut = 'annule'       then 1 end) as annule,
    count(case when statut = 'non_encaisse'
               and date_echeance <= ?
               and date_echeance >= ?
          then 1 end) as echeance_proche
", [
    now()->addDays(7)->toDateString(),  // borne haute — dans 7 jours
    now()->toDateString(),              // borne basse  — pas les déjà expirés
])->first();

        // ─── Query ────────────────────────────────────────────────────────────
        $query = Cheque::query()->with(['client:id,nom_complet', 'payment']);

        // 🔎 Recherche groupée — évite le bug orWhere sans parenthèses
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_cheque', 'like', "%{$search}%")
                  ->orWhere('banque',      'like', "%{$search}%")
                  ->orWhere('titulaire',   'like', "%{$search}%");
            });
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', (int) $request->client_id);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('banque')) {
            $query->where('banque', $request->banque);
        }

        $perPage = min((int) $request->get('per_page', 10), 100);
        $cheques = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'stats'   => $stats,
            'data'    => $cheques->items(),
            'meta'    => [
                'current_page' => $cheques->currentPage(),
                'last_page'    => $cheques->lastPage(),
                'total'        => $cheques->total(),
                'per_page'     => $cheques->perPage(),
            ],
            'message' => 'Chèques récupérés avec succès',
        ], 200);
    }

    /**
     * Création d'un chèque
     * ✅ Pas de DB::transaction — un seul Cheque::create(), rien à rollback
     */
    public function store(StoreChequeRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $path          = $request->filled('client_id') ? 'cheques/' . $request->client_id : 'cheques';
            $data['image'] = $request->file('image')->store($path, 'public');
        }

        $cheque = Cheque::create($data);
        $cheque->load(['client:id,nom_complet', 'payment']);

        return response()->json([
            'success' => true,
            'data'    => $cheque,
            'message' => 'Chèque créé avec succès',
        ], 201);
    }

    /**
     * Détail d'un chèque
     */
    public function show(Cheque $cheque): JsonResponse
    {
        $cheque->load(['client:id,nom_complet', 'payment']);

        return response()->json([
            'success' => true,
            'data'    => $cheque,
            'message' => 'Chèque récupéré avec succès',
        ], 200);
    }

    /**
     * Mise à jour d'un chèque
     * ✅ DB::transaction justifié : suppression image + update SQL doivent être cohérents
     * ✅ refresh() après update() pour recharger les attributs en mémoire
     */
    public function update(UpdateChequeRequest $request, Cheque $cheque): JsonResponse
    {
        $data = $request->validated();

        $cheque = DB::transaction(function () use ($request, $cheque, $data) {

            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image si elle existe
                if ($cheque->image && Storage::disk('public')->exists($cheque->image)) {
                    Storage::disk('public')->delete($cheque->image);
                } elseif ($cheque->image) {
                    Log::warning('Image introuvable pour suppression : ' . $cheque->image);
                }

                $path          = $request->filled('client_id') ? 'cheques/' . $request->client_id : 'cheques';
                $data['image'] = $request->file('image')->store($path, 'public');
            }

            $cheque->update($data);

            // ✅ refresh() recharge les attributs depuis la base après update()
            return $cheque->refresh();
        });

        $cheque->load(['client:id,nom_complet', 'payment']);

        return response()->json([
            'success' => true,
            'data'    => $cheque,
            'message' => 'Chèque mis à jour avec succès',
        ], 200);
    }

    /**
     * Suppression d'un chèque
     * ✅ SQL d'abord, fichier ensuite — la suppression fichier n'est pas rollbackable
     *    Si delete() SQL échoue → exception → fichier intact
     *    Si delete() SQL réussit → on supprime le fichier sans risque
     */
    public function destroy(Cheque $cheque): JsonResponse
    {
        // Sauvegarder le path avant de supprimer l'enregistrement
        $imagePath = $cheque->image;

        // 1. Suppression SQL en premier
        $cheque->delete();

        // 2. Suppression fichier après — seulement si SQL a réussi
        if ($imagePath) {
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            } else {
                Log::warning('Image introuvable pour suppression : ' . $imagePath);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Chèque supprimé avec succès',
        ], 200);
    }
    // PATCH /cheques/{cheque}/encaisser
public function encaisser(Cheque $cheque): JsonResponse
{
    if ($cheque->statut !== 'non_encaisse') {
        return response()->json([
            'success' => false,
            'message' => "Impossible d'encaisser un chèque au statut \"{$cheque->statut}\"",
        ], 422);
    }

    $cheque->update([
        'statut'           => 'encaisse',
        'date_encaissement'=> now()->toDateString(),
    ]);

    return response()->json([
        'success' => true,
        'data'    => $cheque->fresh()->load(['client:id,nom_complet', 'payment']),
        'message' => 'Chèque encaissé avec succès',
    ], 200);
}
// PATCH /cheques/{cheque}/impaye
public function marquerImpaye(Cheque $cheque): JsonResponse
{
    if (!in_array($cheque->statut, ['non_encaisse', 'encaisse'])) {
        return response()->json([
            'success' => false,
            'message' => "Ce chèque ne peut pas être marqué impayé",
        ], 422);
    }

    $cheque->update(['statut' => 'impaye']);

    return response()->json([
        'success' => true,
        'data'    => $cheque->fresh()->load(['client:id,nom_complet', 'payment']),
        'message' => 'Chèque marqué comme impayé',
    ], 200);
}
// PATCH /cheques/{cheque}/annuler
public function annuler(Cheque $cheque): JsonResponse
{
    if ($cheque->statut === 'encaisse') {
        return response()->json([
            'success' => false,
            'message' => 'Impossible d\'annuler un chèque déjà encaissé',
        ], 422);
    }

    $cheque->update(['statut' => 'annule']);

    return response()->json([
        'success' => true,
        'data'    => $cheque->fresh()->load(['client:id,nom_complet', 'payment']),
        'message' => 'Chèque annulé',
    ], 200);
}
// GET /cheques/echeances-proches?jours=7
public function echeancesProches(Request $request): JsonResponse
{
    $jours = min((int) $request->get('jours', 7), 90);

    $cheques = Cheque::where('statut', 'non_encaisse')
        ->whereBetween('date_echeance', [
            now()->toDateString(),
            now()->addDays($jours)->toDateString(),
        ])
        ->with(['client:id,nom_complet'])
        ->orderBy('date_echeance', 'asc')
        ->get();

    return response()->json([
        'success' => true,
        'data'    => $cheques,
        'count'   => $cheques->count(),
        'message' => "Chèques à échéance dans {$jours} jour(s)",
    ], 200);
}
// GET /cheques/client/{client}
public function byClient(Client $client): JsonResponse
{
    $cheques = $client->cheques()
        ->with(['payment'])
        ->orderBy('date_echeance', 'desc')
        ->paginate(10);

    return response()->json([
        'success' => true,
        'data'    => $cheques->items(),
        'meta'    => [
            'current_page' => $cheques->currentPage(),
            'last_page'    => $cheques->lastPage(),
            'total'        => $cheques->total(),
            'per_page'     => $cheques->perPage(),
        ],
        'message' => "Chèques du client {$client->nom_complet}",
    ], 200);
}
}