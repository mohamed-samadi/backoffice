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
        // Add indexes for frequently searched/filtered columns
        Schema::table('clients', function (Blueprint $table) {
            $table->index('statut');
            $table->index('email');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->index('statut');
            $table->index('statut_paiement');
            $table->index(['client_id', 'created_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index('actif');
            $table->index('category_id');
            $table->index('fournisseur_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('statut');
            $table->index('document_id');
        });

        Schema::table('credits', function (Blueprint $table) {
            $table->index('statut');
            $table->index('client_id');
        });

        Schema::table('cheques', function (Blueprint $table) {
            $table->index('statut');
            $table->index('payment_id');
        });

        Schema::table('fournisseurs', function (Blueprint $table) {
            $table->index('actif');
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropIndex(['statut']);
            $table->dropIndex(['email']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex(['statut']);
            $table->dropIndex(['statut_paiement']);
            $table->dropIndex(['client_id', 'created_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['actif']);
            $table->dropIndex(['category_id']);
            $table->dropIndex(['fournisseur_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['statut']);
            $table->dropIndex(['document_id']);
        });

        Schema::table('credits', function (Blueprint $table) {
            $table->dropIndex(['statut']);
            $table->dropIndex(['client_id']);
        });

        Schema::table('cheques', function (Blueprint $table) {
            $table->dropIndex(['statut']);
            $table->dropIndex(['payment_id']);
        });

        Schema::table('fournisseurs', function (Blueprint $table) {
            $table->dropIndex(['actif']);
            $table->dropIndex(['email']);
        });
    }
};
