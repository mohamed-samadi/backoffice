<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
        ];
    }
}
