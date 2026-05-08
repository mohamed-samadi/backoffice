<?php
namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // 1. Calcul des stats (Robuste)
        $stats = Client::selectRaw("
            count(*) as total,
            count(case when statut = 'active' then 1 end) as actifs,
            count(case when statut = 'inactive' then 1 end) as inactifs
        ")->first();

        // 2. Construction de la requête filtrable
        $query = Client::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom_complet', 'like', "%{$search}%")
                  ->orWhere('nom_entreprise', 'like', "%{$search}%");
            });
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $clients = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'stats'   => $stats,
            'data'    => $clients,
            'message' => 'Clients récupérés avec succès'
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom_complet'    => 'required|string|max:255',
            'nom_entreprise' => 'nullable|string|max:255',
            'telephone'      => 'nullable|string|max:50',
            'email'          => 'nullable|email|max:255',
            'adresse'        => 'nullable|string',
            'statut'         => 'required|in:active,inactive', // Validation plus stricte
        ]);

        $client = Client::create($data);

        return response()->json([
            'success' => true,
            'data'    => $client, // On renvoie le client créé, pas toute la liste
            'message' => 'Client créé avec succès'
        ], 201);
    }

}