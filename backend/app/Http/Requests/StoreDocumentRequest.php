<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $type = $this->input('type');
        $lines = collect($this->input('lines', []))
            ->map(function ($line, $index) use ($type) {
                $isDeliveryNote = $type === 'bon_livraison';

                return array_merge($line, [
                    'prix_unitaire_ht' => $isDeliveryNote ? 0 : ($line['prix_unitaire_ht'] ?? 0),
                    'remise' => $isDeliveryNote ? 0 : ($line['remise'] ?? 0),
                    'tva' => $isDeliveryNote ? 0 : ($line['tva'] ?? 0),
                    'ordre' => $line['ordre'] ?? $index,
                ]);
            })
            ->all();

        $this->merge([
            'date_validite' => $type === 'devis' ? $this->input('date_validite') : null,
            'date_echeance' => $type === 'facture' ? $this->input('date_echeance') : null,
            'date_livraison' => $type === 'bon_livraison' ? $this->input('date_livraison') : null,
            'montant_paye' => $type === 'facture' ? ($this->input('montant_paye') ?? 0) : 0,
            'statut_paiement' => $type === 'facture' ? ($this->input('statut_paiement') ?: 'non_paye') : 'non_paye',
            'conditions_paiement' => in_array($type, ['facture', 'devis'], true) ? $this->input('conditions_paiement') : null,
            'lines' => $lines,
        ]);
    }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'numero' => 'required|string|unique:documents,numero',
            'type' => 'required|in:facture,devis,bon_livraison',
            'date_creation' => 'nullable|date',
            'date_validite' => 'nullable|date',
            'date_echeance' => 'nullable|date',
            'date_livraison' => 'nullable|date',
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
        ];
    }
}
