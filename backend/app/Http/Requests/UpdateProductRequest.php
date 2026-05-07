<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class UpdateProductRequest extends FormRequest
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
            'category_id' => 'sometimes|integer|exists:categories,id',
              'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'fournisseur_id' => 'sometimes|integer|exists:fournisseurs,id',
            'nom' => 'sometimes|string|max:255|unique:products,nom,' . $this->product->id,
            'type' => 'sometimes|in:product,service',
            'description' => 'nullable|string|max:1000',
            'prix_unitaire_ht' => 'sometimes|numeric|min:0|decimal:0,2',
            'tva' => 'sometimes|numeric|min:0|max:100|decimal:0,2',
            'prix_revient' => 'sometimes|numeric|min:0|decimal:0,2',
            'quantite_stock' => 'sometimes|integer|min:0',
            'actif' => 'boolean',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $this->product->id,
            'code_barre' => [
    'nullable',
    'string',
    'max:100',
    Rule::unique('products', 'code_barre')
        ->ignore($this->product),
],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_id.exists' => 'La catégorie sélectionnée n\'existe pas',
            'fournisseur_id.exists' => 'Le fournisseur sélectionné n\'existe pas',
            'nom.unique' => 'Un produit avec ce nom existe déjà',
            'nom.max' => 'Le nom ne doit pas dépasser 255 caractères',
            'description.max' => 'La description ne doit pas dépasser 1000 caractères',
            'prix_unitaire_ht.numeric' => 'Le prix unitaire HT doit être un nombre',
            'prix_unitaire_ht.min' => 'Le prix unitaire HT ne peut pas être négatif',
            'tva.numeric' => 'Le taux de TVA doit être un nombre',
            'tva.max' => 'Le taux de TVA ne doit pas dépasser 100%',
            'prix_revient.numeric' => 'Le prix de revient doit être un nombre',
            'prix_revient.min' => 'Le prix de revient ne peut pas être négatif',
            'quantite_stock.integer' => 'La quantité doit être un nombre entier',
            'quantite_stock.min' => 'La quantité ne peut pas être négative',
            'sku.unique' => 'Ce code SKU existe déjà',
            'sku.max' => 'Le code SKU ne doit pas dépasser 100 caractères',
        ];
    }
}
