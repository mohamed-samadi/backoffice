<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Fournisseur;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with(['category', 'fournisseur'])->get();
        return response()->json([
            'success' => true,
            'data' => $products,
            'message' => 'Produits récupérés avec succès'
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix_unitaire_ht' => 'required|numeric|min:0',
            'tva' => 'required|numeric|min:0|max:100',
            'prix_revient' => 'required|numeric|min:0',
            'quantite_stock' => 'required|integer|min:0',
            'actif' => 'boolean',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Produit créé avec succès'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['category', 'fournisseur', 'documentLines']);
        
        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Produit récupéré avec succès'
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'prix_unitaire_ht' => 'sometimes|numeric|min:0',
            'tva' => 'sometimes|numeric|min:0|max:100',
            'prix_revient' => 'sometimes|numeric|min:0',
            'quantite_stock' => 'sometimes|integer|min:0',
            'actif' => 'boolean',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Produit mis à jour avec succès'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé avec succès'
        ], 200);
    }

    /**
     * Get products by category
     */
    public function byCategory(Category $category)
    {
        $products = $category->products()->where('actif', true)->get();
        
        return response()->json([
            'success' => true,
            'category' => $category,
            'products' => $products,
            'message' => 'Produits de la catégorie récupérés'
        ], 200);
    }

    /**
     * Get products by fournisseur
     */
    public function byFournisseur(Fournisseur $fournisseur)
    {
        $products = $fournisseur->products()->where('actif', true)->get();
        
        return response()->json([
            'success' => true,
            'fournisseur' => $fournisseur,
            'products' => $products,
            'message' => 'Produits du fournisseur récupérés'
        ], 200);
    }

    /**
     * Get low stock products
     */
    public function lowStock(Request $request)
    {
        $threshold = $request->query('threshold', 10);
        $products = Product::where('quantite_stock', '<', $threshold)->get();
        
        return response()->json([
            'success' => true,
            'data' => $products,
            'threshold' => $threshold,
            'message' => 'Produits en faible stock'
        ], 200);
    }
}
