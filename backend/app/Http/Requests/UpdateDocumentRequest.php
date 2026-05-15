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
            'statut' => 'nullable|string|max:50',
            'montant_paye' => 'nullable|numeric|min:0',
            'statut_paiement' => 'nullable|string|max:50',
            'conditions_paiement' => 'nullable|string',

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
