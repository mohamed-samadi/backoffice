<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DocumentController extends Controller
{
    public function index(): JsonResponse
    {
        $documents = Document::with('client')
            ->orderBy('id', 'desc')
            ->paginate(15);
        return response()->json($documents);
    }

    public function show(Document $document): JsonResponse
    {
        $document->load('client', 'documentLines', 'payments');
        return response()->json($document);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'numero' => 'required|string|unique:documents,numero',
            'type' => 'required|in:facture,devis,bon_livraison',
            'date_creation' => 'nullable|date',
            'date_validite' => 'nullable|date',
            'statut' => 'nullable|string|max:50',
            'total_ht' => 'nullable|numeric|min:0',
            'total_tva' => 'nullable|numeric|min:0',
            'total_ttc' => 'nullable|numeric|min:0',
            'montant_paye' => 'nullable|numeric|min:0',
            'reste_a_payer' => 'nullable|numeric|min:0',
            'statut_paiement' => 'nullable|string|max:50',
        ]);

        $document = Document::create($data);
        return response()->json($document, 201);
    }

    public function update(Request $request, Document $document): JsonResponse
    {
        $data = $request->validate([
            'client_id' => 'sometimes|required|exists:clients,id',
            'numero' => 'sometimes|required|string|unique:documents,numero,' . $document->id,
            'type' => 'sometimes|required|in:facture,devis,bon_livraison',
            'date_creation' => 'nullable|date',
            'date_validite' => 'nullable|date',
            'statut' => 'nullable|string|max:50',
            'total_ht' => 'nullable|numeric|min:0',
            'total_tva' => 'nullable|numeric|min:0',
            'total_ttc' => 'nullable|numeric|min:0',
            'montant_paye' => 'nullable|numeric|min:0',
            'reste_a_payer' => 'nullable|numeric|min:0',
            'statut_paiement' => 'nullable|string|max:50',
        ]);

        $document->update($data);
        return response()->json($document);
    }

    public function destroy(Document $document): JsonResponse
    {
        $document->delete();
        return response()->json(null, 204);
    }
}
