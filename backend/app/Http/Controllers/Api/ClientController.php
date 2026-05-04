<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = Client::orderBy('id', 'desc')->paginate(15);
        return response()->json($clients);
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json($client);
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

        $client = Client::create($data);
        return response()->json($client, 201);
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
        return response()->json($client);
    }

    public function destroy(Client $client): JsonResponse
    {
        $client->delete();
        return response()->json(null, 204);
    }
}
