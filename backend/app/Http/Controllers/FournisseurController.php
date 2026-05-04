<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $fournisseurs = Fournisseur::all();
        return response()->json([
            'success' => true,
            'data' => $fournisseurs,
            'message' => 'Fournisseurs récupérés avec succès'
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'adresse' => 'nullable|string',
            'actif' => 'boolean',
        ]);

        $fournisseur = Fournisseur::create($validated);

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
    public function update(Request $request, Fournisseur $fournisseur)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'adresse' => 'nullable|string',
            'actif' => 'boolean',
        ]);

        $fournisseur->update($validated);

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
}
