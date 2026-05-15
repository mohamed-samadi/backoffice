<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');
            $table->string('numero')->unique();
            $table->enum('type', ['facture', 'devis', 'bon_livraison']);
            $table->date('date_creation')->nullable();
            $table->date('date_validite')->nullable();
            $table->enum('statut' , ['brouillon','envoyé','accepté'])->default('brouillon');
            $table->decimal('total_ht', 12, 2)->default(0);
            $table->decimal('total_tva', 12, 2)->default(0);
            $table->decimal('total_ttc', 12, 2)->default(0);
            $table->decimal('montant_paye', 12, 2)->default(0);
            $table->decimal('reste_a_payer', 12, 2)->default(0);
            $table->enum('statut_paiement' , ['non_paye' , 'paye' , 'partial'])->default('non_paye');
            $table->text('conditions_paiement')->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('client_id')->
            references('id')->on('clients')->
            onDelete('cascade')  ;
            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
