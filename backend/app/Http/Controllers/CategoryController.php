<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    /**
     * Display a paginated listing of categories with optional filters
     */
    public function index(Request $request)
    {
        // ✅ 1 seule requête pour les stats au lieu de 3
        $stats = Category::selectRaw('
            count(*) as total,
            sum(is_active = 1) as actifs,
            sum(is_active = 0) as inactifs
        ')->first();

        $perPage   = $request->get('per_page', 10);
        $search    = $request->get('search');
        $status    = $request->get('status');
        $sortBy    = $request->get('sort_by', 'created_at');
        $sortOrder = in_array($request->get('sort_order', 'desc'), ['asc', 'desc'])
                        ? $request->get('sort_order', 'desc')
                        : 'desc';

        $query = Category::query();

        // ✅ Search groupé pour éviter le bug orWhere sans parenthèses
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        // ✅ withCount toujours appelé en premier, avant orderBy
        // Évite le double withCount et garantit que products_count
        // est disponible pour le tri ET pour la réponse
        $query->withCount('products');

        $allowed = ['name', 'created_at', 'products_count'];
        if (in_array($sortBy, $allowed)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest();
        }

        $categories = $query->paginate($perPage);

        return response()->json([
            'stats'   => $stats,
            'success' => true,
            'data'    => $categories->items(),
            'meta'    => [
                'current_page' => $categories->currentPage(),
                'last_page'    => $categories->lastPage(),
                'total'        => $categories->total(),
                'per_page'     => $categories->perPage(),
            ],
            'message' => 'Catégories récupérées avec succès',
        ], 200);
    }

    /**
     * Store a newly created category
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());

        return response()->json([
            'success' => true,
            'data'    => $category,
            'message' => 'Catégorie créée avec succès',
        ], 201);
    }

    /**
     * Display a specific category with its products
     */
    public function show(Category $category)
    {
        return response()->json([
            'success' => true,
            'data'    => $category, // products_count est inclus automatiquement
            'message' => 'Catégorie récupérée avec succès',
        ], 200);
    }

    /**
     * Update the specified category
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'data'    => $category,
            'message' => 'Catégorie mise à jour avec succès',
        ], 200);
    }

    /**
     * Delete a category — bloqué si elle contient des produits
     */
    public function destroy(Category $category)
    {
        // ✅ Un seul count() stocké dans une variable
        $productsCount = $category->products()->count();

        if ($productsCount > 0) {
            return response()->json([
                'success'        => false,
                'message'        => 'Impossible de supprimer : cette catégorie contient des produits.',
                'products_count' => $productsCount,
            ], 409);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catégorie supprimée avec succès',
        ], 200);
    }

    /**
     * Get active categories — liste légère pour les selects / dropdowns
     * Garder : index() pagine + fait withCount, trop lourd pour un <select>
     */
    public function active()
    {
        $categories = Category::active()
                               ->select('id', 'name', 'description')
                               ->withCount('products')
                               ->orderBy('name')
                               ->get();
        return response()->json([
            'success' => true,
            'data'    => $categories,
            'count'   => $categories->count(),
            'message' => 'Catégories actives récupérées',
        ], 200);
    }

    /**
     * Get active categories with their product count
     */
    public function withProductCount()
    {
        $categories = Category::active()
                                ->select('id', 'name')
                               ->orderBy('name')
                               ->get();

        return response()->json([
            'success' => true,
            'data'    => $categories,
            'message' => 'Catégories avec comptage de produits',
        ], 200);
    }

    /**
     * Bulk update category status
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids'       => 'required|array',
            'ids.*'     => 'integer|exists:categories,id',
            'is_active' => 'required|boolean',
        ]);

        $count = Category::whereIn('id', $validated['ids'])
                          ->update(['is_active' => $validated['is_active']]);

        return response()->json([
            'success' => true,
            'count'   => $count,
            'message' => "Statut mis à jour pour {$count} catégorie(s)",
        ], 200);
    }
}