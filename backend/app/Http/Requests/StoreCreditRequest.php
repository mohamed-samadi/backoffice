<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCreditRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
public function rules(): array
{
    return [
        'client_id'      => 'required|exists:clients,id',
        'document_id'    => 'nullable|exists:documents,id',
        'numero_credit'  => 'nullable|string|unique:credits,numero_credit',
        'montant_total'  => 'required|numeric|min:0',
        'montant_paye'   => 'nullable|numeric|min:0|max:' . $this->montant_total,
        'date_debut'     => 'required|date',
        'date_echeance'  => 'required|date|after_or_equal:date_debut',
        'statut'         => 'nullable|in:en_attente,actif,en_retard,impaye,solde,annule',
    ];
}
}
