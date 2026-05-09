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
            'telephone'      => ['nullable', 'string', 'max:50'],
            'email'          => ['nullable', 'email','unique:clients,email',  'max:255'],
            'adresse'        => ['nullable', 'string'],
            'statut'         => ['nullable', 'in:active,inactive'],
        ];
    }
    public function messages(): array
    {
        return [
            'email.unique' => 'Cette adresse email est déjà utilisée par un autre client.',
            'nom_complet.required' => 'Le nom complet est requis.',
            'statut.in' => 'Le statut doit être soit "active" soit "inactive".',
        ];
    }
}
