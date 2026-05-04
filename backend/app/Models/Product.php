<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'fournisseur_id',
        'nom',
        'description',
        'prix_unitaire_ht',
        'tva',
        'prix_revient',
        'quantite_stock',
        'actif',
    ];

    protected $casts = [
        'prix_unitaire_ht' => 'decimal:2',
        'tva' => 'decimal:2',
        'prix_revient' => 'decimal:2',
        'quantite_stock' => 'integer',
        'actif' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function documentLines(): HasMany
    {
        return $this->hasMany(DocumentLine::class);
    }
}
