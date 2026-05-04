<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('document_id')->nullable();
            $table->decimal('montant_total', 12, 2);
            $table->decimal('montant_paye', 12, 2)->default(0);
            $table->decimal('reste', 12, 2);
            $table->string('statut')->default('actif');
            $table->date('date_debut');
            $table->date('date_echeance');
            $table->timestamps();

            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('document_id')->references('id')->on('documents')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credits');
    }
};
