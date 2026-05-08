<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreChequeRequest extends FormRequest
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
            'client_id' => ['nullable', 'exists:clients,id'],
            'payment_id' => ['nullable', 'exists:payments,id'],
            'numero_cheque' => ['required', 'string', 'max:255'],
            'banque' => ['required', 'string', 'max:255'],
            'titulaire' => ['required', 'string', 'max:255'],
            'date_emission' => ['required', 'date'],
            'date_echeance' => ['required', 'date', 'after:date_emission'],
            'montant' => ['required', 'numeric'],
            'statut' => ['required', 'in:non_encaisse,encaisse,impaye,annule'],
            'image' => ['nullable', 'image', 'max:2048'], // max 2MB
        ];
    }
    public function messages(): array
    {
        return [
            'client_id.exists' => 'Le client spécifié n\'existe pas.',
            'payment_id.exists' => 'Le paiement spécifié n\'existe pas.',
            'numero_cheque.required' => 'Le numéro de chèque est requis.',
            'banque.required' => 'La banque est requise.',
            'titulaire.required' => 'Le titulaire est requis.',
            'date_emission.required' => 'La date d\'émission est requise.',
            'date_echeance.required' => 'La date d\'échéance est requise.',
            'date_echeance.after' => 'La date d\'échéance doit être après la date d\'émission.',
            'montant.required' => 'Le montant est requis.',
            'statut.required' => 'Le statut est requis.',
            'statut.in' => 'Le statut doit être l\'un des suivants : non_encaisse, encaisse, impaye, annule.',
            'image.image' => 'Le fichier doit être une image.',
            'image.max' => 'L\'image ne doit pas dépasser 2MB.',
        ];
    }
}
