<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompanyRequest;
use App\Http\Requests\UpdateCompanyRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    private function unauthenticatedResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Non autorise. Veuillez vous connecter.',
        ], 401);
    }

    private function forbiddenResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Vous ne pouvez pas acceder a cette societe.',
        ], 403);
    }

    private function userCompany(Request $request): ?Company
    {
        return $request->user()?->company;
    }

    private function ownsCompany(Request $request, string|int $companyId): bool
    {
        $userCompanyId = $request->user()?->company_id;

        return $userCompanyId !== null && (int) $userCompanyId === (int) $companyId;
    }

    /**
     * Display the authenticated user's company.
     */
    public function index(Request $request): JsonResponse
    {
        if (!$request->user()) {
            return $this->unauthenticatedResponse();
        }

        return response()->json([
            'success' => true,
            'data' => $this->userCompany($request),
            'message' => 'Societe recuperee avec succes',
        ], 200);
    }

    /**
     * Return the authenticated user's company logo.
     */
    public function logo(Request $request): JsonResponse
    {
        if (!$request->user()) {
            return $this->unauthenticatedResponse();
        }

        $company = $this->userCompany($request);

        if (!$company || !$company->logo_path) {
            return response()->json([
                'success' => false,
                'message' => 'Logo introuvable',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'company_id' => $company->id,
                'logo_path' => $company->logo_path,
                'logo_url' => Storage::disk('public')->url($company->logo_path),
            ],
            'message' => 'Logo recupere avec succes',
        ], 200);
    }

    /**
     * Store a company and attach it to the authenticated user.
     */
    public function store(StoreCompanyRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        if ($user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'Votre utilisateur est deja associe a une societe.',
            ], 409);
        }

        $data = $request->validated();

        try {
            if ($request->hasFile('logo')) {
                Storage::disk('public')->makeDirectory('companies');
                $data['logo_path'] = $request->file('logo')->store('companies', 'public');
            }

            $company = Company::create($data);

            $user->company()->associate($company);
            $user->save();

            return response()->json([
                'success' => true,
                'data' => $company,
                'message' => 'Societe creee avec succes',
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Company store failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la creation de la societe',
            ], 500);
        }
    }

    /**
     * Display the authenticated user's company when the requested id matches.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        if (!$request->user()) {
            return $this->unauthenticatedResponse();
        }

        if (!$this->ownsCompany($request, $id)) {
            return $this->forbiddenResponse();
        }

        return response()->json([
            'success' => true,
            'data' => $this->userCompany($request),
            'message' => 'Societe recuperee avec succes',
        ], 200);
    }

    /**
     * Update the authenticated user's company.
     */
    public function update(UpdateCompanyRequest $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        if (!$this->ownsCompany($request, $id)) {
            return $this->forbiddenResponse();
        }

        $data = $request->validated();
        $company = $this->userCompany($request);

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Societe introuvable',
            ], 404);
        }

        try {
            if ($request->hasFile('logo')) {
                if ($company->logo_path) {
                    Storage::disk('public')->delete($company->logo_path);
                }

                Storage::disk('public')->makeDirectory('companies');
                $data['logo_path'] = $request->file('logo')->store('companies', 'public');
            }

            $company->update($data);

            return response()->json([
                'success' => true,
                'data' => $company->fresh(),
                'message' => 'Societe mise a jour avec succes',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Company update failed', [
                'company_id' => $id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise a jour de la societe',
            ], 500);
        }
    }

    /**
     * Remove the authenticated user's company and detach it from the user.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return $this->unauthenticatedResponse();
        }

        if (!$this->ownsCompany($request, $id)) {
            return $this->forbiddenResponse();
        }

        $company = $this->userCompany($request);

        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Societe introuvable',
            ], 404);
        }

        try {
            if ($company->logo_path) {
                Storage::disk('public')->delete($company->logo_path);
            }

            $user->company()->dissociate();
            $user->save();

            $company->delete();

            return response()->json([
                'success' => true,
                'message' => 'Societe supprimee avec succes',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Company delete failed', [
                'company_id' => $id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la societe',
            ], 500);
        }
    }
}
