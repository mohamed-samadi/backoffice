<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Http\Requests\StoreCompanyRequest;
use App\Http\Requests\UpdateCompanyRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
      
        //get the first company (assuming there's only one)
        $companies = Company::first();


        return response()->json([
            'success' => true,
            'data' => $companies,
            'message' => 'Sociétés récupérées avec succès'
        ], 
        200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Not used for API-based controllers.
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyRequest $request)
    {
        $data = $request->validated();

        try {
            $company = Company::create($data);

            return response()->json([
                'success' => true,
                'data' => $company,
                'message' => 'Société créée avec succès'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Company store failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la société'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $company = Company::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $company,
                'message' => 'Société récupérée avec succès'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Société introuvable'
            ], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Not used for API-based controllers.
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCompanyRequest $request, string $id)
    {
        $data = $request->validated();

        try {
            $company = Company::findOrFail($id);
            $company->update($data);

            return response()->json([
                'success' => true,
                'data' => $company,
                'message' => 'Société mise à jour avec succès'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Company update failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la société'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $company = Company::findOrFail($id);
            $company->delete();

            return response()->json([
                'success' => true,
                'message' => 'Société supprimée avec succès'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Company delete failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la société'
            ], 500);
        }
    }
}
