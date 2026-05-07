<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Renommer les colonnes de la table categories pour suivre les conventions Laravel
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->renameColumn('nom', 'name');
            $table->renameColumn('actif', 'is_active');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->renameColumn('name', 'nom');
            $table->renameColumn('is_active', 'actif');
        });
    }
};
