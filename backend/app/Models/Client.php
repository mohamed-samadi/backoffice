<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use App\Models\Task;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_complet',
        'nom_entreprise',
        'telephone',
        'email',
        'adresse',
        'statut',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function payments(): HasManyThrough
    {
        return $this->hasManyThrough(Payment::class, Document::class);
    }

    public function credits(): HasMany
    {
        return $this->hasMany(Credit::class);
    }

    public function cheques(): HasMany
    {
        return $this->hasMany(Cheque::class);
    }
}
