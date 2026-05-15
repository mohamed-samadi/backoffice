<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\TaskCategoryController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ChequeController ;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\CompanyController;
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

// ── TASK CATEGORIES ───────────────────────────────────────────────────────
Route::get('task-categories/active', [TaskCategoryController::class, 'active']);
Route::apiResource('task-categories', TaskCategoryController::class);

Route::get('tasks/overdue',                        [TaskController::class, 'overdue'])->name('tasks.overdue');
Route::get('tasks/category/{taskCategory}',        [TaskController::class, 'byCategory'])->name('tasks.byCategory');
Route::patch('tasks/{task}/status',                [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
Route::apiResource('tasks', TaskController::class);

Route::get('clients/active', [ClientController::class, 'active']);
Route::apiResource('clients', ClientController::class);
Route::get('/cheques/echeances-proches',      [ChequeController::class, 'echeancesProches']);
Route::get('/cheques/client/{client}',         [ChequeController::class, 'byClient']);
Route::patch('/cheques/{cheque}/encaisser',    [ChequeController::class, 'encaisser']);
Route::patch('/cheques/{cheque}/impaye',       [ChequeController::class, 'marquerImpaye']);
Route::patch('/cheques/{cheque}/annuler',      [ChequeController::class, 'annuler']);

Route::apiResource('cheques', ChequeController ::class);
Route::get('/credits/en-retard',                    [CreditController::class, 'enRetard']);
Route::get('/credits/client/{clientId}',            [CreditController::class, 'byClient']);
Route::get('/credits/generate-numero',              [CreditController::class, 'generateNumero']);
Route::post('/credits/{credit}/paiement',           [CreditController::class, 'enregistrerPaiement']);
Route::apiResource('credits', CreditController::class);

// ============================================================================
// ROUTES DOCUMENT
// ============================================================================

Route::get('/documents/generate-sku', [DocumentController::class, 'generateSku']);
Route::get('documents/stats', [DocumentController::class, 'stats'])->withoutMiddleware('throttle:api');
Route::apiResource('documents', DocumentController::class)
    ->withoutMiddleware('throttle:api');

// ============================================================================
// ROUTES COMPANY
// ============================================================================
Route::apiResource('/companies', CompanyController::class);
