<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('payment_id')->nullable();
            $table->unsignedBigInteger('client_id')->nullable();
            $table->string('numero_cheque')->unique();
            $table->string('banque');
            $table->string('titulaire');
            $table->date('date_emission');
            $table->date('date_echeance');
            $table->decimal('montant', 12, 2);
            $table->string('statut')->default('non_encaisse');
            $table->string('image')->nullable();
            $table->timestamps();

            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('set null');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheques');
    }
};
