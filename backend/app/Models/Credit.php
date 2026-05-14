<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Credit extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'document_id',
        'numero_credit',
        'user_id',
        'montant_total',
        'montant_paye',
        'reste',
        'statut',
        'date_debut',
        'date_echeance',
    ];

    protected $casts = [
        'montant_total' => 'decimal:2',
        'montant_paye' => 'decimal:2',
        'reste' => 'decimal:2',
        'date_debut' => 'date',
        'date_echeance' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
    protected static function booted()
{
    static::saving(function ($credit) {
        // Calcul automatique du reste
        $credit->reste = $credit->montant_total - ($credit->montant_paye ?? 0);

        // Logique métier : si le reste est 0, on peut passer le statut en 'solde' automatiquement
        if ($credit->reste <= 0) {
            $credit->statut = 'solde';
        }
    });
}
}
