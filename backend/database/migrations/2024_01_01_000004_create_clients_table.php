<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('nom_complet');
            $table->string('nom_entreprise')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->string('ice', 15)->nullable()->unique(); 
            $table->string('identifiant_fiscal')->nullable();
            $table->text('adresse')->nullable();
            $table->string('statut')->default('actif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
