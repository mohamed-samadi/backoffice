<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DocumentController extends Controller
{
  public function index(): JsonResponse
{
    $documents = Document::with([
        'client',
        'documentLines.product'
    ])
    ->orderBy('id', 'desc')
    ->get();

    return response()->json([
        'success' => true,
        'data' => $documents,
        'message' => 'Documents récupérés avec succès'
    ], 200);
}

    public function show(Document $document): JsonResponse
    {
        $document->load('client', 'documentLines', 'payments');
        return response()->json([
            'success' => true,
            'data' => $document,
            'message' => 'Document récupéré avec succès'
        ], 200);
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
            'lines' => 'required|array|min:1',
            'lines.*.product_id' => 'required|exists:products,id',
            'lines.*.description' => 'nullable|string',
            'lines.*.quantite' => 'required|numeric|min:0.01',
            'lines.*.prix_unitaire_ht' => 'required|numeric|min:0',
            'lines.*.remise' => 'nullable|numeric|min:0',
            'lines.*.tva' => 'nullable|numeric|min:0',
            'lines.*.ordre' => 'nullable|integer',
        ]);

        $lines = $data['lines'];
        unset($data['lines']);

        $document = Document::create($data);

        // calculate totals and create lines
        $totalHt = 0;
        $totalTva = 0;
        $totalTtc = 0;

        foreach ($lines as $line) {
            $quantite = (float) ($line['quantite'] ?? 0);
            $prix = (float) ($line['prix_unitaire_ht'] ?? 0);
            $remise = (float) ($line['remise'] ?? 0);
            $tva = (float) ($line['tva'] ?? 0);

            $lineHt = ($quantite * $prix) - $remise;
            if ($lineHt < 0) {
                $lineHt = 0;
            }
            $lineTvaAmount = $lineHt * ($tva / 100);
            $lineTtc = $lineHt + $lineTvaAmount;

            $totalHt += $lineHt;
            $totalTva += $lineTvaAmount;
            $totalTtc += $lineTtc;

            $document->documentLines()->create([
                'product_id' => $line['product_id'],
                'description' => $line['description'] ?? null,
                'quantite' => $quantite,
                'prix_unitaire_ht' => $prix,
                'remise' => $remise,
                'tva' => $tva,
                'total_ht' => $lineHt,
                'total_ttc' => $lineTtc,
                'ordre' => $line['ordre'] ?? 0,
            ]);
        }

        // update document totals
        $document->total_ht = $totalHt;
        $document->total_tva = $totalTva;
        $document->total_ttc = $totalTtc;
        $document->reste_a_payer = $totalTtc - ($document->montant_paye ?? 0);
        $document->save();

        $document->load('documentLines');

        return response()->json([
            'success' => true,
            'data' => $document,
            'message' => 'Document créé avec succès'
        ], 201);
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
            'lines' => 'nullable|array|min:1',
            'lines.*.product_id' => 'required_with:lines|exists:products,id',
            'lines.*.description' => 'nullable|string',
            'lines.*.quantite' => 'required_with:lines|numeric|min:0.01',
            'lines.*.prix_unitaire_ht' => 'required_with:lines|numeric|min:0',
            'lines.*.remise' => 'nullable|numeric|min:0',
            'lines.*.tva' => 'nullable|numeric|min:0',
            'lines.*.ordre' => 'nullable|integer',
        ]);

        $lines = $data['lines'] ?? null;
        if ($lines) {
            unset($data['lines']);
        }

        $document->update($data);

        if ($lines) {
            // replace existing lines
            $document->documentLines()->delete();

            $totalHt = 0;
            $totalTva = 0;
            $totalTtc = 0;

            foreach ($lines as $line) {
                $quantite = (float) ($line['quantite'] ?? 0);
                $prix = (float) ($line['prix_unitaire_ht'] ?? 0);
                $remise = (float) ($line['remise'] ?? 0);
                $tva = (float) ($line['tva'] ?? 0);

                $lineHt = ($quantite * $prix) - $remise;
                if ($lineHt < 0) {
                    $lineHt = 0;
                }
                $lineTvaAmount = $lineHt * ($tva / 100);
                $lineTtc = $lineHt + $lineTvaAmount;

                $totalHt += $lineHt;
                $totalTva += $lineTvaAmount;
                $totalTtc += $lineTtc;

                $document->documentLines()->create([
                    'product_id' => $line['product_id'],
                    'description' => $line['description'] ?? null,
                    'quantite' => $quantite,
                    'prix_unitaire_ht' => $prix,
                    'remise' => $remise,
                    'tva' => $tva,
                    'total_ht' => $lineHt,
                    'total_ttc' => $lineTtc,
                    'ordre' => $line['ordre'] ?? 0,
                ]);
            }

            $document->total_ht = $totalHt;
            $document->total_tva = $totalTva;
            $document->total_ttc = $totalTtc;
            $document->reste_a_payer = $totalTtc - ($document->montant_paye ?? 0);
            $document->save();
        }

        $document->load('documentLines');

        return response()->json([
            'success' => true,
            'data' => $document,
            'message' => 'Document mis à jour avec succès'
        ], 200);
    }

    public function destroy(Document $document): JsonResponse
    {
        $document->delete();
        return response()->json([
            'success' => true,
            'message' => 'Document supprimé avec succès'
        ], 200);
    }
    
}
