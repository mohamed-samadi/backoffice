<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFournisseurRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'nom' => 'sometimes|string|max:255|unique:fournisseurs,nom,' . $this->fournisseur->id,
            'ice' => 'required|digits:15|unique:fournisseurs,ice,' . $this->fournisseur->id,
            'identifiant_fiscal' => 'nullable|string|max:50|unique:fournisseurs,identifiant_fiscal,' . $this->fournisseur->id,
            'contact_nom' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'telephone' => ['nullable', 'regex:/^(?:\+212|212|0)([5-7]\d{8})$/'],
            'email' => 'nullable|email|max:255|unique:fournisseurs,email,' . $this->fournisseur->id,
            'adresse' => 'nullable|string|max:500',
            'ville' => 'nullable|string|max:100',
            'actif' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nom.unique' => 'Un fournisseur avec ce nom existe déjà',
            'nom.max' => 'Le nom ne doit pas dépasser 255 caractères',
            'ice.required' => 'L\'ICE est obligatoire',
            'ice.digits' => 'L\'ICE doit contenir exactement 15 chiffres',
            'ice.unique' => 'Ce numéro ICE existe déjà',
            'identifiant_fiscal.unique' => 'Cet identifiant fiscal existe déjà',
            'identifiant_fiscal.max' => 'L\'identifiant fiscal ne doit pas dépasser 50 caractères',
            'contact_nom.max' => 'Le nom du contact ne doit pas dépasser 255 caractères',
            'description.max' => 'La description ne doit pas dépasser 1000 caractères',
            'telephone.regex' => 'Le numéro de téléphone n\'est pas valide',
            'email.email' => 'L\'email doit être valide',
            'email.unique' => 'Cet email existe déjà',
            'email.max' => 'L\'email ne doit pas dépasser 255 caractères',
            'adresse.max' => 'L\'adresse ne doit pas dépasser 500 caractères',
            'ville.max' => 'La ville ne doit pas dépasser 100 caractères',
        ];
    }
}
