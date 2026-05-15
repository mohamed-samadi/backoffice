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
        'adresse',
        'ville',
        'code_postal',
        'pays',
        'telephone',
        'email',
        'ice',
        'registre_commerce',
        'devise',
        'langue',
        'logo_path',
        'settings',
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

    public function user()
    {
        return $this->hasMany(User::class) ;
    }

}
