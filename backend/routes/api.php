<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DocumentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// ============================================================================
// ROUTES FOURNISSEUR
// ============================================================================
Route::get('/fournisseurs/active', [FournisseurController::class, 'active']);
Route::apiResource('fournisseurs', FournisseurController::class);

// ============================================================================
// ROUTES CATEGORIE
// ============================================================================
Route::get('/categories/active', [CategoryController::class, 'active']);
Route::get('/categories/with-count', [CategoryController::class, 'withProductCount']);
Route::post('/categories/bulk-status', [CategoryController::class, 'bulkUpdateStatus']);
Route::apiResource('categories', CategoryController::class);

// ── PRODUITS ──────────────────────────────────────────────────────────────
Route::get('/products/generate-sku', [ProductController::class, 'generateSku']);
Route::get('products/stock/low',               [ProductController::class, 'lowStock'])->name('products.lowStock');
Route::get('products/category/{category}',     [ProductController::class, 'byCategory'])->name('products.byCategory');
Route::get('products/fournisseur/{fournisseur}',[ProductController::class, 'byFournisseur'])->name('products.byFournisseur');

// ✅ POST pour update (method spoofing FormData — _method=PUT dans le FormData)
Route::put('products/{product}',               [ProductController::class, 'update'])->name('products.update');

// ✅ except('update') pour éviter la route PUT/PATCH en double
Route::apiResource('products', ProductController::class)->except(['update']);

// ============================================================================
// ROUTES CLIENT
// ============================================================================


Route::apiResource('clients', ClientController::class);




// ============================================================================
// ROUTES DOCUMENT
// ============================================================================
Route::get('documents/stats', [DocumentController::class, 'stats'])->withoutMiddleware('throttle:api');
Route::apiResource('documents', DocumentController::class)
    ->withoutMiddleware('throttle:api');

