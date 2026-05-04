<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;

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

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working fine!'
    ]);
});

// ============================================================================
// ROUTES FOURNISSEUR
// ============================================================================
Route::apiResource('fournisseurs', FournisseurController::class);

// ============================================================================
// ROUTES CATEGORIE
// ============================================================================
Route::apiResource('categories', CategoryController::class);
Route::get('/categories/active/list', [CategoryController::class, 'active'])->name('categories.active');
Route::get('/categories/with-count', [CategoryController::class, 'withProductCount'])->name('categories.withCount');

// ============================================================================
// ROUTES PRODUIT
// ============================================================================
Route::apiResource('products', ProductController::class);
Route::get('/products/category/{category}', [ProductController::class, 'byCategory'])->name('products.byCategory');
Route::get('/products/fournisseur/{fournisseur}', [ProductController::class, 'byFournisseur'])->name('products.byFournisseur');
Route::get('/products/stock/low', [ProductController::class, 'lowStock'])->name('products.lowStock');

// ============================================================================
// ROUTES CLIENT & DOCUMENT
// ============================================================================
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DocumentController;

Route::apiResource('clients', ClientController::class);
Route::apiResource('documents', DocumentController::class);

