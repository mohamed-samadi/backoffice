<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'category_id' => 'required|integer|exists:categories,id',
            'fournisseur_id' => 'nullable|integer|exists:fournisseurs,id',
            'nom' => 'required|string|max:255|unique:products,nom',
            'type' => 'required|in:product,service',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'description' => 'nullable|string|max:1000',
            'prix_unitaire_ht' => 'required|numeric|min:0|decimal:0,2',
            'tva' => 'required|numeric|min:0|max:100|decimal:0,2',
            'prix_revient' => 'required|numeric|min:0|decimal:0,2',
            'quantite_stock' => 'required|integer|min:0',
            'actif' => 'boolean',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'code_barre' => 'nullable|string|max:100|unique:products,code_barre',
            'seuil_alerte_stock' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'La catégorie est obligatoire',
            'category_id.exists' => 'La catégorie sélectionnée n\'existe pas',
            'fournisseur_id.required' => 'Le fournisseur est obligatoire',
            'fournisseur_id.exists' => 'Le fournisseur sélectionné n\'existe pas',
            'nom.required' => 'Le nom du produit est obligatoire',
            'nom.unique' => 'Un produit avec ce nom existe déjà',
            'nom.max' => 'Le nom ne doit pas dépasser 255 caractères',
            'description.max' => 'La description ne doit pas dépasser 1000 caractères',
            'prix_unitaire_ht.required' => 'Le prix unitaire HT est obligatoire',
            'prix_unitaire_ht.numeric' => 'Le prix unitaire HT doit être un nombre',
            'prix_unitaire_ht.min' => 'Le prix unitaire HT ne peut pas être négatif',
            'tva.required' => 'Le taux de TVA est obligatoire',
            'tva.numeric' => 'Le taux de TVA doit être un nombre',
            'tva.max' => 'Le taux de TVA ne doit pas dépasser 100%',
            'prix_revient.required' => 'Le prix de revient est obligatoire',
            'prix_revient.numeric' => 'Le prix de revient doit être un nombre',
            'prix_revient.min' => 'Le prix de revient ne peut pas être négatif',
            'quantite_stock.required' => 'La quantité en stock est obligatoire',
            'quantite_stock.integer' => 'La quantité doit être un nombre entier',
            'quantite_stock.min' => 'La quantité ne peut pas être négative',
            'sku.unique' => 'Ce code SKU existe déjà',
            'sku.max' => 'Le code SKU ne doit pas dépasser 100 caractères',
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
