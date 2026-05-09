<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->string('telephone')->nullable();    
            $table->string('email')->nullable();
            $table->text('adresse')->nullable();
            $table->boolean('actif')->default(true);
            $table->string('ice', 15)->nullable()->unique(); 
            $table->string('identifiant_fiscal')->nullable();
            $table->string('contact_nom')->nullable(); 
            $table->string('ville')->default('Tanger');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fournisseurs');
    }
};
