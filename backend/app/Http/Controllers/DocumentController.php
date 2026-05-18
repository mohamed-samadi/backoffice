<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;

class DocumentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 10), 100);
        $search = trim((string) $request->get('search', ''));
        $type = trim((string) $request->get('type', ''));
        $statut = trim((string) $request->get('statut', ''));
        $statutPaiement = trim((string) $request->get('statut_paiement', ''));

        $query = Document::with([
            'client',
            'documentLines.product'
        ]);

        if ($search !== '') {
            $query->where(function ($subQuery) use ($search) {
                $subQuery
                    ->where('numero', 'like', '%' . $search . '%')
                    ->orWhere('type', 'like', '%' . $search . '%')
                    ->orWhereHas('client', function ($clientQuery) use ($search) {
                        $clientQuery
                            ->where('nom_complet', 'like', '%' . $search . '%')
                            ->orWhere('nom_entreprise', 'like', '%' . $search . '%');
                    });
            });
        }

        if ($type !== '') {
            $query->where('type', '=', $type);
        }

        if ($statut !== '') {
            $query->where('statut', '=', $statut);
        }

        if ($statutPaiement !== '') {
            $query->where('statut_paiement', '=', $statutPaiement);
        }

        $documents = $query->orderBy('id', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $documents->items(),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
                'total' => $documents->total(),
                'per_page' => $documents->perPage(),
            ],
            'message' => 'Documents récupérés avec succès'
        ], 200);
    }

    public function stats(Request $request): JsonResponse
    {
        $search = trim((string) $request->get('search', ''));
        $type = trim((string) $request->get('type', ''));

        $query = Document::query();

        if ($search !== '') {
            $query->where(function ($subQuery) use ($search) {
                $subQuery
                    ->where('numero', 'like', '%' . $search . '%')
                    ->orWhere('type', 'like', '%' . $search . '%')
                    ->orWhereHas('client', function ($clientQuery) use ($search) {
                        $clientQuery
                            ->where('nom_complet', 'like', '%' . $search . '%')
                            ->orWhere('nom_entreprise', 'like', '%' . $search . '%');
                    });
            });
        }

        if ($type !== '') {
            $query->where('type', '=', $type);
        }

        $total = $query->count();
        $factures = (clone $query)->where('type', 'facture')->count();
        $devis = (clone $query)->where('type', 'devis')->count();
        $bon_livraison = (clone $query)->where('type', 'bon_livraison')->count();
        $payes = (clone $query)->where('type', 'facture')->whereIn('statut_paiement', ['payé', 'paye'])->count();
        $impayes = (clone $query)->where('type', 'facture')->whereNotIn('statut_paiement', ['payé', 'paye'])->count();
        
        $totals = (clone $query)->select(
            DB::raw('SUM(total_ttc) as total_ttc'),
            DB::raw('SUM(reste_a_payer) as reste_a_payer')
        )->first();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'factures' => $factures,
                'devis' => $devis,
                'bon_livraison' => $bon_livraison,
                'payes' => $payes,
                'impayes' => $impayes,
                'total_ttc' => (float) ($totals->total_ttc ?? 0),
                'reste_a_payer' => (float) ($totals->reste_a_payer ?? 0),
            ],
            'message' => 'Statistiques des documents'
        ], 200);
    }

    public function globalStats(): JsonResponse
    {
        $baseQuery = Document::query();

        $total = (clone $baseQuery)->count();
        $factures = (clone $baseQuery)->where('type', 'facture')->count();
        $devis = (clone $baseQuery)->where('type', 'devis')->count();
        $bonLivraison = (clone $baseQuery)->where('type', 'bon_livraison')->count();

        $payes = (clone $baseQuery)->where('type', 'facture')->whereIn('statut_paiement', ['payé', 'paye'])->count();
        $partiels = (clone $baseQuery)->where('type', 'facture')->whereIn('statut_paiement', ['partiel', 'partial'])->count();
        $impayes = (clone $baseQuery)->where('type', 'facture')->whereNotIn('statut_paiement', ['payé', 'paye'])->count();

        $totals = (clone $baseQuery)->select(
            DB::raw('SUM(total_ht) as total_ht'),
            DB::raw('SUM(total_tva) as total_tva'),
            DB::raw('SUM(total_ttc) as total_ttc'),
            DB::raw('SUM(montant_paye) as montant_paye'),
            DB::raw('SUM(reste_a_payer) as reste_a_payer')
        )->first();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'by_type' => [
                    'factures' => $factures,
                    'devis' => $devis,
                    'bon_livraison' => $bonLivraison,
                ],
                'by_payment_status' => [
                    'payes' => $payes,
                    'partiels' => $partiels,
                    'impayes' => $impayes,
                ],
                'amounts' => [
                    'total_ht' => (float) ($totals->total_ht ?? 0),
                    'total_tva' => (float) ($totals->total_tva ?? 0),
                    'total_ttc' => (float) ($totals->total_ttc ?? 0),
                    'montant_paye' => (float) ($totals->montant_paye ?? 0),
                    'reste_a_payer' => (float) ($totals->reste_a_payer ?? 0),
                ],
            ],
            'message' => 'Statistiques globales des documents'
        ], 200);
    }

    public function show(Document $document): JsonResponse
    {
        $document->load('client', 'documentLines.product', 'payments');
        return response()->json([
            'success' => true,
            'data' => $document,
            'message' => 'Document récupéré avec succès'
        ], 200);
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $lines = $data['lines'];
        $document = DB::transaction(function () use ($data, $lines) {
            unset($data['lines']);

            $document = Document::create($data);

            $totalHt = 0;
            $totalTva = 0;
            $totalTtc = 0;

            foreach ($lines as $line) {
                $quantite = (float) ($line['quantite'] ?? 0);
                $prix = (float) ($line['prix_unitaire_ht'] ?? 0);
                $remise = (float) ($line['remise'] ?? 0);
                $tva = (float) ($line['tva'] ?? 0);

                $lineHt = max(($quantite * $prix) - $remise, 0);
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

            $document->update([
                'total_ht' => $totalHt,
                'total_tva' => $totalTva,
                'total_ttc' => $totalTtc,
                'reste_a_payer' => $totalTtc - ($document->montant_paye ?? 0),
            ]);

            return $document;
        });

        $document->load('documentLines.product', 'client');

        return response()->json([
            'success' => true,
            'data' => $document,
            'message' => 'Document créé avec succès'
        ], 201);
    }

public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
{
    try {
        $data = $request->validated();

        $lines = $data['lines'] ?? null;
        if ($lines) {
            unset($data['lines']);
        }

        DB::transaction(function () use ($document, $data, $lines) {
            // update document fields
            $document->update($data);

            if ($lines !== null) {
                // replace lines and recalc totals
                $document->documentLines()->delete();

                $totalHt = 0;
                $totalTva = 0;
                $totalTtc = 0;

                foreach ($lines as $line) {
                    $quantite = (float) ($line['quantite'] ?? 0);
                    $prix = (float) ($line['prix_unitaire_ht'] ?? 0);
                    $remise = (float) ($line['remise'] ?? 0);
                    $tva = (float) ($line['tva'] ?? 0);

                    $lineHt = max(($quantite * $prix) - $remise, 0);
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

                $document->update([
                    'total_ht' => $totalHt,
                    'total_tva' => $totalTva,
                    'total_ttc' => $totalTtc,
                    'reste_a_payer' => $totalTtc - ($document->montant_paye ?? 0),
                ]);
            } elseif (array_key_exists('montant_paye', $data)) {
                $document->update([
                    'reste_a_payer' => max((float) ($document->total_ttc ?? 0) - (float) ($document->montant_paye ?? 0), 0),
                ]);
            }
        });

        $document->load('documentLines.product', 'client');

        return response()->json([
            'success' => true,
            'data' => $document,
            'message' => 'Document mis à jour avec succès'
        ], 200);

    } catch (\Exception $e) {
        Log::error('Document update failed', ['id' => $document->id ?? null, 'error' => $e->getMessage()]);

        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
        ], 500);
    }
}

    public function destroy(Document $document): JsonResponse
    {
        $document->delete();
        return response()->json([
            'success' => true,
            'message' => 'Document supprimé avec succès'
        ], 200);
    }
    public function generateSku(Request $request): JsonResponse
    {
        $type = trim((string) $request->get('type', ''));
        if (!in_array($type, ['facture', 'devis', 'bon_livraison'])) {
            return response()->json([
                'success' => false,
                'message' => 'Type de document invalide'
            ], 400);
        }

        $prefix = strtoupper(substr($type, 0, 3));
        $currentYear = date('Y');

        $lastDocument = Document::where('type', $type)
            ->whereYear('created_at', $currentYear)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastDocument) {
            $lastNumber = (int) substr($lastDocument->numero, -6);
            $number = $lastNumber + 1;
        } else {
             $number = 1;
        }

        $sku = $prefix . '-'.date('Y') . '-' . str_pad($number, 6, '0', STR_PAD_LEFT);

        return response()->json([
            'success' => true,
            'sku' => $sku,
            'message' => 'SKU généré avec succès'
        ], 200);

    }
    
}
