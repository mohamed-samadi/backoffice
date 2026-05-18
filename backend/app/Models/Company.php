<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'nom_commercial',

        // Contact
        'email',
        'telephone',

        // Address
        'adresse',
        'ville',
        'code_postal',
        'pays',

        // Legal info
        'ice',
        'registre_commerce',
        'identifiant_fiscal',

        // Bank info
        'bank',
        'iban',

        // Branding
        'logo_path',

        // Status
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class) ;
    }

}
