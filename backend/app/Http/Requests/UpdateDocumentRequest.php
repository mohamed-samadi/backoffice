<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $routeDocument = $this->route('document');
        $type = $this->input('type', $routeDocument instanceof \App\Models\Document ? $routeDocument->type : null);
        $merge = [];

        if ($this->has('lines')) {
            $merge['lines'] = collect($this->input('lines', []))
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
        }

        if ($this->has('type')) {
            $merge['date_validite'] = $type === 'devis' ? $this->input('date_validite') : null;
            $merge['date_echeance'] = $type === 'facture' ? $this->input('date_echeance') : null;
            $merge['date_livraison'] = $type === 'bon_livraison' ? $this->input('date_livraison') : null;
            $merge['montant_paye'] = $type === 'facture' ? ($this->input('montant_paye') ?? 0) : 0;
            $merge['statut_paiement'] = $type === 'facture' ? ($this->input('statut_paiement') ?: 'non_paye') : 'non_paye';
            $merge['conditions_paiement'] = in_array($type, ['facture', 'devis'], true) ? $this->input('conditions_paiement') : null;
        }

        if ($merge) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        $document = $this->route('document');
        $ignoreId = $document instanceof \App\Models\Document ? $document->id : null;

        return [
            'client_id' => 'sometimes|required|exists:clients,id',
            'numero' => [
                'sometimes',
                'required',
                'string',
                Rule::unique('documents', 'numero')->ignore($ignoreId),
            ],
            'type' => 'sometimes|required|in:facture,devis,bon_livraison',
            'date_creation' => 'nullable|date',
            'date_validite' => 'nullable|date',
            'date_echeance' => 'nullable|date',
            'date_livraison' => 'nullable|date',
            'statut' => 'nullable|string|max:50',
            'montant_paye' => 'nullable|numeric|min:0',
            'statut_paiement' => 'nullable|string|max:50',

            'lines' => 'sometimes|array|min:1',
            'lines.*.product_id' => 'required_with:lines|exists:products,id',
            'lines.*.description' => 'nullable|string',
            'lines.*.quantite' => 'required_with:lines|numeric|min:0.01',
            'lines.*.prix_unitaire_ht' => 'required_with:lines|numeric|min:0',
            'lines.*.remise' => 'nullable|numeric|min:0',
            'lines.*.tva' => 'nullable|numeric|min:0',
            'lines.*.ordre' => 'nullable|integer',
        ];
    }
}
