<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController; // ✅ إضافة الـ AuthController الجديد
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\TaskCategoryController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ChequeController;
use App\Http\Controllers\CreditController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ============================================================================
// 🔓 مسارات مفتوحة (PUBLIC ROUTES)
// ============================================================================
// مسار تسجيل الدخول لا يحتاج حماية لأنه البوابة للنظام
// ملاحظة: لأننا نعتمد على Sanctum (SPA) + جلسات، نحتاج Middleware `web`
// داخل Routes API وإلا سيظهر الخطأ: "Session store not set on request."
Route::post('/login', [AuthController::class, 'login'])->middleware('web');
Route::post('/register', [AuthController::class, 'register'])->middleware('web');

// ============================================================================
// 🔒 مسارات محمية (PROTECTED ROUTES) - يجب تسجيل الدخول للوصول إليها
// ============================================================================
// Route::middleware('auth:sanctum')->group(function () {

    // ─── مسارات المستخدم والتحقق من الجلسة ───────────────────────────────────
    Route::get('/me', [AuthController::class, 'me'])->middleware('web');       // جلب بيانات المستخدم الحالي
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('web'); // تسجيل الخروج
    
    // المسار القديم الذي يأتي مع لارافيل (يمكنك تركه أو حذفه لأن /me تعوضه)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ─── DASHBOARD ──────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ─── FOURNISSEURS ───────────────────────────────────────────────────────
    Route::get('/fournisseurs/active', [FournisseurController::class, 'active']);
    Route::get('/fournisseurs/villes', [FournisseurController::class, 'villes']);
    Route::apiResource('fournisseurs', FournisseurController::class);

    // ─── CATEGORIES ─────────────────────────────────────────────────────────
    Route::get('/categories/active', [CategoryController::class, 'active']);
    Route::get('/categories/with-count', [CategoryController::class, 'withProductCount']);
    Route::post('/categories/bulk-status', [CategoryController::class, 'bulkUpdateStatus']);
    Route::apiResource('categories', CategoryController::class);

    // ─── PRODUITS ───────────────────────────────────────────────────────────
    Route::get('/products/generate-sku', [ProductController::class, 'generateSku']);
    Route::get('products/stock/low', [ProductController::class, 'lowStock'])->name('products.lowStock');
    Route::get('products/category/{category}', [ProductController::class, 'byCategory'])->name('products.byCategory');
    Route::get('products/fournisseur/{fournisseur}', [ProductController::class, 'byFournisseur'])->name('products.byFournisseur');
    Route::put('products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::apiResource('products', ProductController::class)->except(['update']);

    // ─── TASK CATEGORIES ────────────────────────────────────────────────────
    Route::get('task-categories/active', [TaskCategoryController::class, 'active']);
    Route::apiResource('task-categories', TaskCategoryController::class);

    // ─── TASKS ──────────────────────────────────────────────────────────────
    Route::get('tasks/overdue', [TaskController::class, 'overdue'])->name('tasks.overdue');
    Route::get('tasks/category/{taskCategory}', [TaskController::class, 'byCategory'])->name('tasks.byCategory');
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
    Route::apiResource('tasks', TaskController::class);

    // ─── CLIENTS ────────────────────────────────────────────────────────────
    Route::get('clients/active', [ClientController::class, 'active']);
    Route::apiResource('clients', ClientController::class);

    // ─── CHEQUES ────────────────────────────────────────────────────────────
    Route::get('/cheques/echeances-proches', [ChequeController::class, 'echeancesProches']);
    Route::get('/cheques/client/{client}', [ChequeController::class, 'byClient']);
    Route::patch('/cheques/{cheque}/encaisser', [ChequeController::class, 'encaisser']);
    Route::patch('/cheques/{cheque}/impaye', [ChequeController::class, 'marquerImpaye']);
    Route::patch('/cheques/{cheque}/annuler', [ChequeController::class, 'annuler']);
    Route::get('/cheques/banques', [ChequeController::class, 'banqueOptions']);
    Route::apiResource('cheques', ChequeController::class);

    // ─── CREDITS ────────────────────────────────────────────────────────────
    Route::get('/credits/en-retard', [CreditController::class, 'enRetard']);
    Route::get('/credits/client/{clientId}', [CreditController::class, 'byClient']);
    Route::get('/credits/generate-numero', [CreditController::class, 'generateNumero']);
    Route::post('/credits/{credit}/paiement', [CreditController::class, 'enregistrerPaiement']);
    Route::apiResource('credits', CreditController::class);

    // ─── DOCUMENTS ──────────────────────────────────────────────────────────
    Route::get('/documents/generate-sku', [DocumentController::class, 'generateSku']);
    Route::get('documents/stats', [DocumentController::class, 'stats'])->withoutMiddleware('throttle:api');
    Route::get('documents/stats/global', [DocumentController::class, 'globalStats'])->withoutMiddleware('throttle:api');
    Route::apiResource('documents', DocumentController::class)->withoutMiddleware('throttle:api');

    // ─── COMPANIES ──────────────────────────────────────────────────────────
    Route::get('/companies/logo', [CompanyController::class, 'logo']);
    Route::apiResource('/companies', CompanyController::class);

    // ─── NOTIFICATIONS ──────────────────────────────────────────────────────
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/count', [NotificationController::class, 'count']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/', [NotificationController::class, 'destroyAll']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

// });