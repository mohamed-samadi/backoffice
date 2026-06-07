<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
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
            'nom_complet'    => ['required', 'string', 'max:255'],
            'nom_entreprise' => ['nullable', 'string', 'max:255'],
            'telephone' => ['nullable', 'regex:/^(?:\+212|212|0)([5-7]\d{8})$/'],
            'ice'            => 'required|digits:15|unique:clients,ice',
            'identifiant_fiscal' => 'nullable|string|max:50|unique:clients,identifiant_fiscal',
            'email'          => ['nullable', 'email','unique:clients,email',  'max:255'],
            'adresse'        => ['nullable', 'string'],
            'statut'         => ['nullable', 'in:active,inactive'],
        ];
    }
    public function messages(): array
    {
        return [
            'email.unique' => 'Cette adresse email est déjà utilisée par un autre client.',
            'ice.required' => 'L\'ICE est obligatoire.',
            'ice.digits' => 'L\'ICE doit contenir exactement 15 chiffres.',
            'ice.unique' => 'Cet ICE est déjà enregistré pour un autre client.',
            'identifiant_fiscal.unique' => 'Cet identifiant fiscal est déjà enregistré pour un autre client.',
            'identifiant_fiscal.max' => 'L\'identifiant fiscal ne doit pas dépasser 50 caractères.',
            'nom_complet.required' => 'Le nom complet est requis.',
            'telephone.regex' => 'Le numéro de téléphone n\'est pas valide.',
            'statut.in' => 'Le statut doit être soit "active" soit "inactive".',
        ];
    }
}
