<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;
use App\Http\Requests\StoreFournisseurRequest;
use App\Http\Requests\UpdateFournisseurRequest;

class FournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index(Request $request)
{
$stats = [
        'total' => Fournisseur::count(),
        'actifs' => Fournisseur::where('actif', true)->count(),
        'inactifs' => Fournisseur::where('actif', false)->count(),
        'villes' => Fournisseur::distinct('ville')->count('ville'),
    ];

    $query = Fournisseur::query();

    // 2. Recherche par texte (Nom, Email ou ICE)
    if ($request->has('search')) {
        $search = $request->input('search');
        $query->where(function($q) use ($search) {
            $q->where('nom', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%")
              ->orWhere('ice', 'LIKE', "%{$search}%");
        });
    }

    // 3. Filtrage par statut (Actif / Inactif)
    if ($request->has('actif')) {
        $query->where('actif', $request->boolean('actif'));
    }

    // 4. Filtrage par ville (Optionnel, utile pour ton contexte à Tanger)
    if ($request->has('ville_filter')) {
        $query->where('ville', $request->input('ville_filter'));
    }

    // 5. Pagination (10 par défaut, ou dynamique via le front)
    $perPage = $request->input('per_page', 10);
    $fournisseurs = $query->latest()->paginate($perPage);

    // 6. Retour structuré pour ton Frontend React
    return response()->json([
        'success' => true,
        'data' => $fournisseurs->items(),
        'stats' => $stats,
        'meta' => [
            'current_page' => $fournisseurs->currentPage(),
            'last_page' => $fournisseurs->lastPage(),
            'total' => $fournisseurs->total(),
            'per_page' => $fournisseurs->perPage(),
        ],
        'message' => 'Fournisseurs récupérés avec succès'
    ], 200);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFournisseurRequest $request)
    {
        $fournisseur = Fournisseur::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => $fournisseur,
            'message' => 'Fournisseur créé avec succès'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Fournisseur $fournisseur)
    {
        return response()->json([
            'success' => true,
            'data' => $fournisseur,
            'products' => $fournisseur->products()->get(),
            'message' => 'Fournisseur récupéré avec succès'
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFournisseurRequest $request, Fournisseur $fournisseur)
    {
        $fournisseur->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => $fournisseur,
            'message' => 'Fournisseur mis à jour avec succès'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fournisseur $fournisseur)
    {
        $fournisseur->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fournisseur supprimé avec succès'
        ], 200);
    }
    public function active()
    {
        $fournisseurs = Fournisseur::where('actif', true)->get(['id', 'nom']);

        return response()->json([
            'success' => true,
            'data' => $fournisseurs,
            'message' => 'Fournisseurs actifs récupérés avec succès'
        ], 200);
    }
    public function villes()
{
    $villes = Fournisseur::select('ville')
        ->distinct()
        ->whereNotNull('ville')
        ->orderBy('ville')
        ->pluck('ville');

    return response()->json($villes);
}
}
