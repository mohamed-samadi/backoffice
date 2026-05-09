<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
class ClientController extends Controller
{
    /**
     * Liste paginée avec stats et filtres
     */
    public function index(Request $request): JsonResponse
    {
        // ─── Stats (1 requête) — ✅ sans virgule finale ────────────────
        $stats = Client::selectRaw("
            count(*)                          as total,
            sum(statut = 'active')            as actifs,
            sum(statut = 'inactive')          as inactifs
        ")->first();

        // ─── Query Builder — ✅ un seul $query, pas de if/if/assign ───
        $perPage   = min((int) $request->get('per_page', 10), 100);
        $sortOrder = in_array($request->get('sort_order', 'desc'), ['asc', 'desc'])
                        ? $request->get('sort_order', 'desc')
                        : 'desc';

        $query = Client::query();

        // 🔎 Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom_complet',     'like', "%{$search}%")
                  ->orWhere('nom_entreprise','like', "%{$search}%")
                  ->orWhere('telephone',     'like', "%{$search}%")
                  ->orWhere('email',         'like', "%{$search}%");
            });
        }

        // 🗂 Filtre statut
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        // ─── Tri ───────────────────────────────────────────────────────
        $allowed = ['nom_complet', 'nom_entreprise', 'created_at'];
        $sortBy  = in_array($request->get('sort_by'), $allowed)
                    ? $request->get('sort_by')
                    : 'created_at';
        $query->orderBy($sortBy, $sortOrder);

        // ✅ Pagination
        $clients = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'stats'   => $stats,
            'data'    => $clients->items(),
            'meta'    => [
                'current_page' => $clients->currentPage(),
                'last_page'    => $clients->lastPage(),
                'total'        => $clients->total(),
                'per_page'     => $clients->perPage(),
            ],
            'message' => 'Clients récupérés avec succès',
        ], 200);
    }

    /**
     * Création client
     * ✅ FIX : Client::create($data) manquait — retourne le client créé
     */
    public function store(StoreClientRequest $request): JsonResponse
    {
        $data = $request->validated();
        // ✅ Valeur par défaut si statut non envoyé
        $data['statut'] = $data['statut'] ?? 'active';

        $client = Client::create($data); // ✅ création manquante

        return response()->json([
            'success' => true,
            'data'    => $client,        // ✅ retourne le client créé, pas toute la liste
            'message' => 'Client créé avec succès',
        ], 201);
    }

    /**
     * Détail client
     */
    public function show(Client $client): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $client,
            'message' => 'Client récupéré avec succès',
        ], 200);
    }

    /**
     * Mise à jour client
     * ✅ FIX : ->fresh() pour retourner les données réelles après update
     */
    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $data = $request->validated();

        $client->update($data);

        return response()->json([
            'success' => true,
            'data'    => $client->fresh(), // ✅ données fraîches depuis la BDD
            'message' => 'Client mis à jour avec succès',
        ], 200);
    }

    /**
     * Suppression client
     */
    public function destroy(Client $client): JsonResponse
    {
        $client->delete();

        return response()->json([
            'success' => true,
            'data'    => null,
            'message' => 'Client supprimé avec succès',
        ], 200);
    }


    public function active(): JsonResponse
    {
        $clients = Client::where('statut', 'active')
            ->orderBy('nom_complet')
            ->get(['id', 'nom_complet', 'nom_entreprise', 'telephone']);

        return response()->json([
            'success' => true,
            'data'    => $clients,
            'message' => 'Clients actifs récupérés avec succès',
        ], 200);
    }
}