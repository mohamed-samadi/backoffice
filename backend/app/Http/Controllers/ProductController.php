<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Liste des produits avec filtres backend
     */
    public function index(Request $request): JsonResponse
    {
        // ─── Stats globales (1 requête) ───────────────────────────────────────
        $stats = Product::selectRaw('
            count(*)                                    as total,
            sum(actif = 1)                              as actifs,
            sum(actif = 0)                              as inactifs,
            sum(quantite_stock)                         as stock_total,
            sum(quantite_stock < 10)                    as stock_faible,
            round(avg(prix_unitaire_ht), 2)             as prix_moyen
        ')->first();


        // ─── Paramètres ───────────────────────────────────────────────────────
        $perPage   = min((int) $request->get('per_page', 10), 100);
        $search    = $request->get('search');
        $sortBy    = $request->get('sort_by', 'created_at');
        $sortOrder = in_array($request->get('sort_order', 'desc'), ['asc', 'desc'])
                        ? $request->get('sort_order', 'desc')
                        : 'desc';

        // ─── Query Builder ────────────────────────────────────────────────────
        $query = Product::query()->with(['category:id,name', 'fournisseur:id,nom']);

        // 🔎 Recherche
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // 🗂 Filtre catégorie
        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->category_id);
        }

        // 🏭 Filtre fournisseur  
        if ($request->filled('fournisseur_id')) {
            $query->where('fournisseur_id', (int) $request->fournisseur_id);
        }

        // ✅ Filtre actif
        if ($request->has('actif') && $request->actif !== '') {
            $query->where('actif', $request->boolean('actif'));
        }

        // 💰 Filtre prix min
        if ($request->filled('min_price') && is_numeric($request->min_price)) {
            $query->where('prix_unitaire_ht', '>=', (float) $request->min_price);
        }

        // 💰 Filtre prix max
        if ($request->filled('max_price') && is_numeric($request->max_price)) {
            $query->where('prix_unitaire_ht', '<=', (float) $request->max_price);
        }
        if($request->filled('type') && in_array($request->type, ['product', 'service'])) {
            $query->where('type', $request->type);
        }

        // ─── Tri ──────────────────────────────────────────────────────────────
        $allowed = ['nom', 'prix_unitaire_ht', 'quantite_stock', 'created_at'];
        if (in_array($sortBy, $allowed)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest();
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'stats'   => $stats,
            'data'    => $products->items(),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
                'per_page'     => $products->perPage(),
            ],
            'message' => 'Liste des produits récupérée avec succès',
        ], 200);
    }

    /**
     * Création produit
     * ✅ FIX : une seule requête INSERT (au lieu de create() + update())
     * ✅ FIX : transaction pour éviter les fichiers orphelins en cas d'erreur
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();

        $product = DB::transaction(function () use ($request, $data) {

            // Stocker l'image AVANT le create() → une seule requête SQL
            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')
                    ->store('products', 'public');
            }

            return Product::create($data);
        });

        $product->load(['category:id,name', 'fournisseur:id,nom']);

        return response()->json([
            'success' => true,
            'data'    => $product,
            'message' => 'Produit créé avec succès',
        ], 201);
    }

    /**
     * Détail produit
     */
    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'fournisseur']);

        return response()->json([
            'success' => true,
            'data'    => $product,
            'message' => 'Produit récupéré avec succès',
        ], 200);
    }

    /**
     * Mise à jour produit
     * ✅ FIX : transaction pour garantir la cohérence image ↔ base de données
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        $product = DB::transaction(function () use ($request, $product, $data) {

            if ($request->hasFile('image')) {
                // Supprimer l'ancienne image
                if ($product->image) {
                    Storage::disk('public')->delete($product->image);
                }
                // Stocker la nouvelle
                $data['image'] = $request->file('image')
                    ->store('products', 'public');
            }

            $product->update($data);

            return $product;
        });

        $product->load(['category:id,name', 'fournisseur:id,nom']);

        return response()->json([
            'success' => true,
            'data'    => $product,
            'message' => 'Produit mis à jour avec succès',
        ], 200);
    }

    /**
     * Suppression produit
     * ✅ FIX : transaction pour éviter la suppression fichier sans suppression BDD
     */
    public function destroy(Product $product): JsonResponse
    {
        DB::transaction(function () use ($product) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $product->delete();
        });

        return response()->json([
            'success' => true,
            'data'    => null,
            'message' => 'Produit supprimé avec succès',
        ], 200);
    }

    /**
     * Produits par catégorie
     */
    public function byCategory(Category $category): JsonResponse
    {
        $products = $category->products()
            ->with(['fournisseur:id,nom'])
            ->where('actif', true)
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $products->items(),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
                'per_page'     => $products->perPage(),
            ],
            'message' => "Produits de la catégorie {$category->name}",
        ], 200);
    }

    /**
     * Produits par fournisseur
     */
    public function byFournisseur(Fournisseur $fournisseur): JsonResponse
    {
        $products = $fournisseur->products()
            ->with(['category:id,name'])
            ->where('actif', true)
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $products->items(),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
                'per_page'     => $products->perPage(),
            ],
            'message' => "Produits du fournisseur {$fournisseur->nom}",
        ], 200);
    }

    /**
     * Produits en faible stock
     * ✅ FIX : validation du threshold via $request->validate()
     */
    public function lowStock(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'threshold' => ['sometimes', 'integer', 'min:1', 'max:10000'],
            'per_page'  => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $threshold = $validated['threshold'] ?? 10;
        $perPage   = $validated['per_page']  ?? 10;

        $products = Product::where('quantite_stock', '<', $threshold)
            ->with(['category:id,name', 'fournisseur:id,nom'])
            ->orderBy('quantite_stock', 'asc') // les plus critiques en premier
            ->paginate($perPage);

        return response()->json([
            'success'   => true,
            'threshold' => $threshold,
            'data'      => $products->items(),
            'meta'      => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
                'per_page'     => $products->perPage(),
            ],
            'message' => "Produits avec stock inférieur à {$threshold}",
        ], 200);
    }
    public function generateSku(Request $request)
    {
        $type = $request->query('type', 'product');
        // $type = 'service';
        $prefix = $type === 'service' ? 'SRV' : 'PRD';

        $lastProduct = Product::where('sku', 'like', $prefix . '-%')
            ->latest('id')
            ->first();

        $number = 1;

        if ($lastProduct) {
            $lastNumber = (int) str_replace($prefix . '-', '', $lastProduct->sku);
            $number = $lastNumber + 1;
        }

        $sku = $prefix . '-' . str_pad($number, 6, '0', STR_PAD_LEFT);

        return response()->json([
            'sku' => $sku
        ]);
    }
}