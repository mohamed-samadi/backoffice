<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'sometimes|required|string|max:191',
            'nom_commercial' => 'nullable|string|max:191',
            'email' => 'nullable|email|max:191|unique:companies,email,' . $this->route('company'),
            'telephone' => 'nullable|string|max:30',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:100',
            'code_postal' => 'nullable|string|max:20',
            'pays' => 'nullable|string|max:100',
            'ice' => 'nullable|string|max:50|unique:companies,ice,' . $this->route('company'),
            'registre_commerce' => 'nullable|string|max:50|unique:companies,registre_commerce,' . $this->route('company'),
            'identifiant_fiscal' => 'nullable|string|max:50|unique:companies,identifiant_fiscal,' . $this->route('company'),
            'bank' => 'nullable|string|max:191',
            'iban' => 'nullable|string|max:100',
            'logo_path' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            
        ];
    }
}
