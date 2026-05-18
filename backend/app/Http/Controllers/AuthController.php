<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * ─── POST /api/login ──────────────────────────────────────────────────
     * تسجيل دخول المستخدم وتوليد الجلسة
     */
    // ─── POST /api/register ───────────────────────────────────────────────
public function register(Request $request): JsonResponse
{
    // 1. التحقق من البيانات المدخلة
    $data = $request->validate([
        'name'       => ['required', 'string', 'max:255'],
        'email'      => ['required', 'string', 'email', 'max:255', 'unique:users'],
        'password'   => ['required', 'string', 'min:8', 'confirmed'], //Confirmed تعني أنه يجب إرسال حقل password_confirmation
        'company_id' => ['nullable', 'exists:companies,id'], // التأكد من أن الشركة موجودة في قاعدة البيانات إذا أُرسلت
    ]);

    // 2. إنشاء المستخدم (التشفيير يتم تلقائياً بفضل الـ Cast في الموديل)
    $user = User::create($data);

    // 3. تسجيل الدخول تلقائياً بعد التسجيل (اختياري، حسب رغبتك)
    Auth::login($user);
    $request->session()->regenerate();
    return response()->json([
        'success' => true,
        'message' => 'تم إنشاء الحساب وتسجيل الدخول بنجاح.',
        'user'    => [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'created_at' => $user->created_at,
        ],
    ], 201); // 201 تعني Created
}
    public function login(Request $request): JsonResponse
    {
        // 1. التحقق من المدخلات
        $credentials = $request->validate([
            'email'    => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
        ]);

        // 2. محاولة تسجيل الدخول (Auth::attempt تقوم بالتحقق من الإيميل وتشفير كلمة المرور تلقائياً)
        if (!Auth::attempt($credentials, remember: $request->boolean('remember', false))) {
            // إرسال خطأ موحد ومبهم لأسباب أمنية (حتى لا يعرف المخترق هل الإيميل أم كلمة المرور هي الخاطئة)
            throw ValidationException::withMessages([
                'email' => ['البيانات المدخلة غير متطابقة مع سجلاتنا.'],
            ]);
        }

        // 3. حماية ضد هجمات تثبيت الجلسة (Session Fixation) عبر تجديد معرف الجلسة
        $request->session()->regenerate();

        // 4. جلب بيانات المستخدم المتصل حالياً
        /** @var User $user */
        $user = Auth::user();

        // 5. إرجاع بيانات المستخدم بنجاح
        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح.',
            'user'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'created_at' => $user->created_at,
            ],
        ], 200);
    }

    /**
     * ─── POST /api/logout ─────────────────────────────────────────────────
     * تسجيل خروج المستخدم وتدمير الجلسة والتوكنز
     */
    public function logout(Request $request): JsonResponse
    {
        // 1. تسجيل الخروج من الـ Guard الخاص بـ Web (وهو المستخدم في Sanctum SPA)
        Auth::guard('web')->logout();

        // 2. تدمير الجلسة الحالية وإلغاء صلاحيتها تماماً
        $request->session()->invalidate();

        // 3. تجديد توكن الـ CSRF لحماية الطلبات القادمة
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح.',
        ], 200);
    }

    /**
     * ─── GET /api/me ──────────────────────────────────────────────────────
     * جلب بيانات المستخدم المتصل حالياً (مهمة جداً للـ React لمعرفة حالة الـ Auth عند تحديث الصفحة)
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        // حماية إضافية في حال تم استدعاء الدالة بدون حماية الـ Middleware
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح بالدخول، يرجى تسجيل الدخول أولاً.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'created_at' => $user->created_at,
            ],
        ], 200);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorise.',
            ], 401);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil mis a jour avec succes.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
        ], 200);
    }
}
