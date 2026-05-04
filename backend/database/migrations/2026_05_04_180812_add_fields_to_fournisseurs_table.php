<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('fournisseurs', function (Blueprint $table) {
            $table->string('ice', 15)->nullable()->unique()->after('nom'); // Identifiant Commun de l'Entreprise
            $table->string('identifiant_fiscal')->nullable()->after('ice');
            $table->string('contact_nom')->nullable()->after('identifiant_fiscal'); // Nom de la personne à contacter
            $table->string('ville')->default('Tanger')->after('adresse');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fournisseurs', function (Blueprint $table) {
            $table->dropUnique(['ice']);
            $table->dropColumn(['ice', 'identifiant_fiscal', 'contact_nom', 'ville']);
        });
    }
};
