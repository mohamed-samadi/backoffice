<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index()
{
    // On utilise directement paginate() sur le modèle
    $categories = Category::latest()->paginate(10); 

    return response()->json([
        'success' => true,
        'data' => $categories->items(), // Les données des catégories
        'meta' => [ // Informations de pagination pour ton frontend
            'current_page' => $categories->currentPage(),
            'last_page' => $categories->lastPage(),
            'total' => $categories->total(),
            'per_page' => $categories->perPage(),
        ],
        'message' => 'Catégories récupérées avec succès'
    ], 200);
}

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'actif' => 'boolean',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Catégorie créée avec succès'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load('products');
        return response()->json([
            'success' => true,
            'data' => $category,
            'products_count' => $category->products()->count(),
            'message' => 'Catégorie récupérée avec succès'
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255|unique:categories,nom,' . $category->id,
            'description' => 'nullable|string',
            'actif' => 'boolean',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'data' => $category,
            'message' => 'Catégorie mise à jour avec succès'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Vérifier si la catégorie a des produits
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une catégorie qui contient des produits'
            ], 409);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catégorie supprimée avec succès'
        ], 200);
    }

    /**
     * Get all active categories
     */
    public function active()
    {
        $categories = Category::where('actif', true)->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Catégories actives récupérées'
        ], 200);
    }

    /**
     * Get categories with product count
     */
    public function withProductCount()
    {
        $categories = Category::withCount('products')->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories,
            'message' => 'Catégories avec nombre de produits'
        ], 200);
    }
}
