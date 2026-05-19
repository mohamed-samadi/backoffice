<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'company_id' => ['nullable', 'exists:companies,id'],
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'email.required' => 'L adresse email est obligatoire.',
            'email.email' => 'L adresse email est invalide.',
            'email.unique' => 'Cette adresse email est deja utilisee.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caracteres.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'company_id.exists' => 'La societe selectionnee est introuvable.',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Compte cree avec succes.',
            'user' => $this->userPayload($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
        ], [
            'email.required' => 'L adresse email est obligatoire.',
            'email.email' => 'L adresse email est invalide.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caracteres.',
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember', false))) {
            if ($this->loginLegacyPlainPasswordUser($request, $credentials)) {
                /** @var User $user */
                $user = Auth::user();

                return response()->json([
                    'success' => true,
                    'message' => 'Connexion reussie.',
                    'user' => $this->userPayload($user),
                ]);
            }

            throw ValidationException::withMessages([
                'email' => ['Adresse email ou mot de passe incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        /** @var User $user */
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'message' => 'Connexion reussie.',
            'user' => $this->userPayload($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Deconnexion reussie.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez etre connecte pour acceder a cette ressource.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => $this->userPayload($user),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez etre connecte pour modifier votre profil.',
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
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'email.required' => 'L adresse email est obligatoire.',
            'email.email' => 'L adresse email est invalide.',
            'email.unique' => 'Cette adresse email est deja utilisee.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caracteres.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
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
            'user' => $this->userPayload($user),
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'created_at' => $user->created_at,
        ];
    }

    private function loginLegacyPlainPasswordUser(Request $request, array $credentials): bool
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || Hash::isHashed($user->password)) {
            return false;
        }

        if (!hash_equals($user->password, $credentials['password'])) {
            return false;
        }

        $user->password = Hash::make($credentials['password']);
        $user->save();

        Auth::login($user, $request->boolean('remember', false));
        $request->session()->regenerate();

        return true;
    }
}
