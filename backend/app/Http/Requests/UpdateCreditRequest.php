<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCreditRequest extends FormRequest
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
    $creditId = $this->route('credit')->id;

    return [
        'client_id'      => 'sometimes|required|exists:clients,id',
        'numero_credit'  => 'sometimes|required|string|unique:credits,numero_credit,' . $creditId,
        'montant_total'  => 'sometimes|required|numeric|min:0',
        'montant_paye'   => 'sometimes|required|numeric|min:0',
        'date_echeance'  => 'sometimes|required|date|after_or_equal:date_debut',
        'statut'         => 'sometimes|required|in:en_attente,actif,en_retard,impaye,solde,annule',
    ];
}
}
