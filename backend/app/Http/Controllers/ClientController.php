<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = Client::all()->sortByDesc('id');
        return response()->json([
            'success' => true,
            'data' => $clients,
            'message' => 'Clients récupérés avec succès'
        ], 200);
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $client,
            'message' => 'Client récupéré avec succès'
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom_complet' => 'required|string|max:255',
            'nom_entreprise' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'adresse' => 'nullable|string',
            'statut' => 'nullable|string|max:50',
        ]);

            $clients = Client::orderBy('id', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $clients,
            'message' => 'Client créé avec succès'
        ], 201);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'nom_complet' => 'sometimes|required|string|max:255',
            'nom_entreprise' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'adresse' => 'nullable|string',
            'statut' => 'nullable|string|max:50',
        ]);

        $client->update($data);
        return response()->json([
            'success' => true,
            'data' => $client,
            'message' => 'Client mis à jour avec succès'
        ], 200);
    }

    public function destroy(Client $client): JsonResponse
    {
        $client->delete();
        return response()->json([
            'success' => true,
            'message' => 'Client supprimé avec succès'
        ], 200);
    }
   public function active()
{
    $clients = Client::where('statut', 'active')
    ->select('id', 'nom_complet')
    ->get();

    return response()->json([
        'success' => true,
        'data' => $clients
    ], 200);
}
}
