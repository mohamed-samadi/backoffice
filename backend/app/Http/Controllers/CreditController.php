<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Models\Credit;
use App\Http\Requests\StoreCreditRequest;
use App\Http\Requests\UpdateCreditRequest;

class CreditController extends Controller
{
    /**
     * Liste paginée des crédits avec stats et filtres
     */
    public function index(Request $request): JsonResponse
    {
        // ─── Stats (1 requête) ────────────────────────────────────────────────
        $stats = Credit::selectRaw('
            COUNT(*)                                                        as total_credits,
            COALESCE(SUM(montant_total), 0)                                 as montant_total,
            COALESCE(SUM(montant_paye), 0)                                  as montant_paye,
            COALESCE(SUM(reste), 0)                                         as total_reste,
            SUM(CASE WHEN reste > 0 THEN 1 ELSE 0 END)                     as en_cours,
            SUM(CASE WHEN reste = 0 THEN 1 ELSE 0 END)                     as payes,
            SUM(CASE WHEN date_echeance < CURDATE() AND reste > 0 THEN 1 ELSE 0 END) as en_retard
        ')->first();

        // ─── Query ────────────────────────────────────────────────────────────
        $query = Credit::with('client:id,nom_complet');

        // 🔎 Recherche — variable renommée pour éviter la collision de $q
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_credit', 'like', "%{$search}%")
                  ->orWhereHas('client', function ($clientQuery) use ($search) {
                      // ✅ $clientQuery au lieu de $q — évite l'écrasement de la variable
                      $clientQuery->where('nom_complet', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', (int) $request->client_id);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        // ✅ per_page dynamique avec limite max
        $perPage = min((int) $request->get('per_page', 10), 100);
        $credits = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'stats'   => $stats,
            'data'    => $credits->items(),
            'meta'    => [
                'current_page' => $credits->currentPage(),
                'last_page'    => $credits->lastPage(),
                'per_page'     => $credits->perPage(),
                'total'        => $credits->total(),
            ],
            'message' => 'Crédits récupérés avec succès',
        ], 200);
    }

    /**
     * Création d'un crédit
     * ✅ Numéro généré dans store() avec lockForUpdate — évite la race condition
     *    de generateNumero() séparé (deux utilisateurs simultanés = même numéro)
     */
    public function store(StoreCreditRequest $request): JsonResponse
    {
        $data = $request->validated();

        $credit = DB::transaction(function () use ($data) {
            // ✅ lockForUpdate() verrouille la ligne pour éviter les doublons
            //    en cas d'appels simultanés
            $last   = Credit::lockForUpdate()->latest('id')->first();
            $nextId = $last ? $last->id + 1 : 1;

            $data['numero_credit'] = 'CR-' . date('Y') . '-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

            $credit = Credit::create($data);

            // ✅ Charger les relations dans la transaction
            $credit->load('client:id,nom_complet');

            return $credit;
        });

        return response()->json([
            'success' => true,
            'data'    => $credit,
            'message' => 'Crédit créé avec succès',
        ], 201);
    }

    /**
     * Détail d'un crédit
     */
    public function show(Credit $credit): JsonResponse
    {
        $credit->load('client:id,nom_complet');

        return response()->json([
            'success' => true,
            'data'    => $credit,
            'message' => 'Crédit récupéré avec succès',
        ], 200);
    }

    /**
     * Mise à jour d'un crédit
     * ✅ refresh() après update() pour recharger les attributs en mémoire
     */
    public function update(UpdateCreditRequest $request, Credit $credit): JsonResponse
    {
        $credit->update($request->validated());

        return response()->json([
            'success' => true,
            'data'    => $credit->refresh()->load('client:id,nom_complet'),
            'message' => 'Crédit mis à jour avec succès',
        ], 200);
    }

    /**
     * Suppression d'un crédit
     */
    public function destroy(Credit $credit): JsonResponse
    {
        $credit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Crédit supprimé avec succès',
        ], 200);
    }

    /**
     * Générer un numéro de crédit — endpoint de prévisualisation uniquement
     * ⚠️  Ce numéro N'EST PAS réservé — il peut changer si un autre crédit
     *     est créé entre l'appel et le submit du formulaire.
     *     Le vrai numéro définitif est généré dans store() avec lockForUpdate().
     *     Utiliser cet endpoint uniquement pour afficher un aperçu dans le formulaire.
     */
    public function generateNumero(): JsonResponse
    {
        $last      = Credit::latest('id')->first();
        $nextId    = $last ? $last->id + 1 : 1;
        $numero    = 'CR-' . date('Y') . '-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

        return response()->json([
            'numero_credit' => $numero,
        ], 200);
    }

    /**
     * Enregistrer un paiement partiel sur un crédit
     * Met à jour montant_paye et recalcule le reste
     */
    public function enregistrerPaiement(Request $request, Credit $credit): JsonResponse
    {
        $validated = $request->validate([
            'montant_paiement' => 'required|numeric|min:0.01|max:' . $credit->reste,
        ], [
            'montant_paiement.required' => 'Le montant du paiement est obligatoire',
            'montant_paiement.max'      => "Le montant ne peut pas dépasser le reste dû ({$credit->reste} MAD)",
            'montant_paiement.min'      => 'Le montant doit être supérieur à 0',
        ]);

        $credit = DB::transaction(function () use ($credit, $validated) {
            $nouveauMontantPaye = (float) $credit->montant_paye + (float) $validated['montant_paiement'];
            $nouveauReste       = (float) $credit->montant_total - $nouveauMontantPaye;

            $credit->update([
                'montant_paye' => round($nouveauMontantPaye, 2),
                'reste'        => round(max(0, $nouveauReste), 2),
                // ✅ Passer automatiquement le statut à "payé" si reste = 0
                'statut'       => $nouveauReste <= 0 ? 'paye' : $credit->statut,
            ]);

            return $credit->refresh()->load('client:id,nom_complet');
        });

        return response()->json([
            'success' => true,
            'data'    => $credit,
            'message' => 'Paiement enregistré avec succès',
        ], 200);
    }

    /**
     * Crédits en retard — pour alertes / dashboard
     */
    public function enRetard(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 10), 100);

        $credits = Credit::with('client:id,nom_complet')
            ->where('reste', '>', 0)
            ->where('date_echeance', '<', now()->toDateString())
            ->orderBy('date_echeance', 'asc') // les plus anciens en premier
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $credits->items(),
            'meta'    => [
                'current_page' => $credits->currentPage(),
                'last_page'    => $credits->lastPage(),
                'per_page'     => $credits->perPage(),
                'total'        => $credits->total(),
            ],
            'message' => 'Crédits en retard récupérés',
        ], 200);
    }

    /**
     * Crédits d'un client — pour la fiche client
     */
    public function byClient(Request $request, int $clientId): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 10), 100);

        $credits = Credit::where('client_id', $clientId)
            ->with('client:id,nom_complet')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $credits->items(),
            'meta'    => [
                'current_page' => $credits->currentPage(),
                'last_page'    => $credits->lastPage(),
                'per_page'     => $credits->perPage(),
                'total'        => $credits->total(),
            ],
            'message' => "Crédits du client récupérés",
        ], 200);
    }
}