<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Http\Requests\StoreChequeRequest;
class UpdateChequeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ne pas oublier de mettre true
    }

    public function rules(): array
    {
        return [
            'client_id' => ['nullable', 'exists:clients,id'],
            'payment_id' => ['nullable', 'exists:payments,id'],
            'numero_cheque' => ['sometimes', 'required', 'string', 'max:255'],
            'banque' => ['sometimes', 'required', 'string', 'max:255'],
            'titulaire' => ['sometimes', 'required', 'string', 'max:255'],
            'date_emission' => ['sometimes', 'required', 'date'],
            'date_echeance' => ['sometimes', 'required', 'date', 'after_or_equal:date_emission'],
            'montant' => ['sometimes', 'required', 'numeric'],
            'statut' => ['sometimes', 'required', 'in:non_encaisse,encaisse,impaye,annule'],
            'image' => ['nullable', 'image', 'max:2048'],
            'date_encaissement' => ['nullable', 'date'], // Ajouté car utile lors de l'update
        ];
    }

    // Tu peux réutiliser les mêmes messages ou laisser Laravel gérer par défaut
    public function messages(): array
    {
        return (new StoreChequeRequest())->messages();
    }
}