<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFournisseurRequest extends FormRequest
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
            'nom' => 'required|string|max:255|unique:fournisseurs,nom',
            'ice' => 'nullable|string|max:50|unique:fournisseurs,ice',
            'identifiant_fiscal' => 'nullable|string|max:50|unique:fournisseurs,identifiant_fiscal',
            'contact_nom' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255|unique:fournisseurs,email',
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
            'nom.required' => 'Le nom du fournisseur est obligatoire',
            'nom.unique' => 'Un fournisseur avec ce nom existe déjà',
            'nom.max' => 'Le nom ne doit pas dépasser 255 caractères',
            'ice.unique' => 'Ce numéro ICE existe déjà',
            'ice.max' => 'Le numéro ICE ne doit pas dépasser 50 caractères',
            'identifiant_fiscal.unique' => 'Cet identifiant fiscal existe déjà',
            'identifiant_fiscal.max' => 'L\'identifiant fiscal ne doit pas dépasser 50 caractères',
            'contact_nom.max' => 'Le nom du contact ne doit pas dépasser 255 caractères',
            'description.max' => 'La description ne doit pas dépasser 1000 caractères',
            'telephone.max' => 'Le téléphone ne doit pas dépasser 20 caractères',
            'email.email' => 'L\'email doit être valide',
            'email.unique' => 'Cet email existe déjà',
            'email.max' => 'L\'email ne doit pas dépasser 255 caractères',
            'adresse.max' => 'L\'adresse ne doit pas dépasser 500 caractères',
            'ville.max' => 'La ville ne doit pas dépasser 100 caractères',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'actif' => $this->actif ?? true,
        ]);
    }
}
