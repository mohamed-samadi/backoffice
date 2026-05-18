<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
            'documentLines.product',
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
            $query->where('type', $type);
        }

        if ($statut !== '') {
            $query->where('statut', $statut);
        }

        if ($statutPaiement !== '') {
            $query->where('statut_paiement', $statutPaiement);
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
            'message' => 'Documents recuperes avec succes',
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
            $query->where('type', $type);
        }

        $total = $query->count();
        $factures = (clone $query)->where('type', 'facture')->count();
        $devis = (clone $query)->where('type', 'devis')->count();
        $bonLivraison = (clone $query)->where('type', 'bon_livraison')->count();
        $paidStatuses = ['paye', 'payé', 'payÃ©'];
        $payes = (clone $query)->where('type', 'facture')->whereIn('statut_paiement', $paidStatuses)->count();
        $impayes = (clone $query)->where('type', 'facture')->whereNotIn('statut_paiement', $paidStatuses)->count();

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
                'bon_livraison' => $bonLivraison,
                'payes' => $payes,
                'impayes' => $impayes,
                'total_ttc' => (float) ($totals->total_ttc ?? 0),
                'reste_a_payer' => (float) ($totals->reste_a_payer ?? 0),
            ],
            'message' => 'Statistiques des documents',
        ], 200);
    }

    public function globalStats(): JsonResponse
    {
        $baseQuery = Document::query();

        $total = (clone $baseQuery)->count();
        $factures = (clone $baseQuery)->where('type', 'facture')->count();
        $devis = (clone $baseQuery)->where('type', 'devis')->count();
        $bonLivraison = (clone $baseQuery)->where('type', 'bon_livraison')->count();

        $paidStatuses = ['paye', 'payé', 'payÃ©'];
        $payes = (clone $baseQuery)->where('type', 'facture')->whereIn('statut_paiement', $paidStatuses)->count();
        $partiels = (clone $baseQuery)->where('type', 'facture')->whereIn('statut_paiement', ['partiel', 'partial'])->count();
        $impayes = (clone $baseQuery)->where('type', 'facture')->whereNotIn('statut_paiement', $paidStatuses)->count();

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
            'message' => 'Statistiques globales des documents',
        ], 200);
    }

    public function show(Document $document): JsonResponse
    {
        $document->load('client', 'documentLines.product', 'payments');

        return response()->json([
            'success' => true,
            'data' => $document,
            'message' => 'Document recupere avec succes',
        ], 200);
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $lines = $data['lines'] ?? [];

            $document = DB::transaction(function () use ($data, $lines) {
                unset($data['lines']);

                $this->ensureProductsExist($lines);

                $document = Document::create($data);
                $totals = $this->syncDocumentLines($document, $lines);

                if ($document->type === 'facture') {
                    $this->applyStockMovement($lines, -1);
                }

                $document->update([
                    'total_ht' => $totals['total_ht'],
                    'total_tva' => $totals['total_tva'],
                    'total_ttc' => $totals['total_ttc'],
                    'reste_a_payer' => max($totals['total_ttc'] - (float) ($document->montant_paye ?? 0), 0),
                ]);

                return $document;
            });

            $document->load('documentLines.product', 'client');

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document cree avec succes',
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Document store failed', [
                'error' => $e->getMessage(),
                'payload' => $request->except(['lines']),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e instanceof \InvalidArgumentException
                    ? $e->getMessage()
                    : 'Erreur lors de la creation du document',
            ], $e instanceof \InvalidArgumentException ? 422 : 500);
        }
    }

    public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
    {
        try {
            $data = $request->validated();
            $oldType = $document->type;
            $oldLines = $document->documentLines()
                ->select('product_id', 'quantite')
                ->get()
                ->map(fn ($line) => [
                    'product_id' => $line->product_id,
                    'quantite' => $line->quantite,
                ])
                ->all();

            $lines = $data['lines'] ?? null;
            if ($lines !== null) {
                unset($data['lines']);
            }

            DB::transaction(function () use ($document, $data, $lines, $oldType, $oldLines) {
                $document->update($data);

                if ($lines !== null) {
                    $this->ensureProductsExist($lines);

                    if ($oldType === 'facture') {
                        $this->applyStockMovement($oldLines, 1);
                    }

                    $document->documentLines()->delete();
                    $totals = $this->syncDocumentLines($document, $lines);

                    if ($document->type === 'facture') {
                        $this->applyStockMovement($lines, -1);
                    }

                    $document->update([
                        'total_ht' => $totals['total_ht'],
                        'total_tva' => $totals['total_tva'],
                        'total_ttc' => $totals['total_ttc'],
                        'reste_a_payer' => max($totals['total_ttc'] - (float) ($document->montant_paye ?? 0), 0),
                    ]);
                } elseif ($oldType === 'facture' && $document->type !== 'facture') {
                    $this->applyStockMovement($oldLines, 1);
                } elseif ($oldType !== 'facture' && $document->type === 'facture') {
                    $this->applyStockMovement($oldLines, -1);
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
                'message' => 'Document mis a jour avec succes',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Document update failed', [
                'id' => $document->id ?? null,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e instanceof \InvalidArgumentException
                    ? $e->getMessage()
                    : 'Erreur lors de la mise a jour',
            ], $e instanceof \InvalidArgumentException ? 422 : 500);
        }
    }

    public function destroy(Document $document): JsonResponse
    {
        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document supprime avec succes',
        ], 200);
    }

    public function generateSku(Request $request): JsonResponse
    {
        $type = trim((string) $request->get('type', ''));
        if (!in_array($type, ['facture', 'devis', 'bon_livraison'])) {
            return response()->json([
                'success' => false,
                'message' => 'Type de document invalide',
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

        $sku = $prefix . '-' . date('Y') . '-' . str_pad($number, 6, '0', STR_PAD_LEFT);

        return response()->json([
            'success' => true,
            'sku' => $sku,
            'message' => 'SKU genere avec succes',
        ], 200);
    }

    private function syncDocumentLines(Document $document, array $lines): array
    {
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

        return [
            'total_ht' => $totalHt,
            'total_tva' => $totalTva,
            'total_ttc' => $totalTtc,
        ];
    }

    private function applyStockMovement(array $lines, int $direction): void
    {
        foreach ($lines as $line) {
            $productId = $line['product_id'] ?? null;
            $quantite = (float) ($line['quantite'] ?? 0);

            if (!$productId || $quantite <= 0) {
                throw new \InvalidArgumentException('Ligne de document invalide pour la mise a jour du stock.');
            }

            $product = Product::whereKey($productId)->lockForUpdate()->first();

            if (!$product) {
                throw new \InvalidArgumentException("Produit introuvable: {$productId}");
            }

            $product->increment('quantite_stock', $direction * $quantite);
        }
    }

    private function ensureProductsExist(array $lines): void
    {
        $productIds = collect($lines)
            ->pluck('product_id')
            ->filter()
            ->unique()
            ->values();

        if ($productIds->isEmpty()) {
            throw new \InvalidArgumentException('Aucun produit valide dans les lignes du document.');
        }

        $existingCount = Product::whereIn('id', $productIds)->count();

        if ($existingCount !== $productIds->count()) {
            throw new \InvalidArgumentException('Un ou plusieurs produits sont introuvables.');
        }
    }
}
