<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:191',
            'nom_commercial' => 'nullable|string|max:191',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:100',
            'code_postal' => 'nullable|string|max:20',
            'pays' => 'nullable|string|max:100',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:191',
            'ice' => 'nullable|string|max:100',
            'registre_commerce' => 'nullable|string|max:100',
            'devise' => 'nullable|string|max:10',
            'langue' => 'nullable|string|max:10',
            'logo_path' => 'nullable|string|max:255',
            'settings' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ];
    }
}
