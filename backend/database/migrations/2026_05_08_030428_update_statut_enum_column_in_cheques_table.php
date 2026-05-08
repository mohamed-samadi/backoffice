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
       Schema::table('cheques', function (Blueprint $table) {
        $table->enum('statut', [
            'non_encaisse',
            'encaisse',
            'impaye',
            'annule',
        ])->default('non_encaisse');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cheques', function (Blueprint $table) {
            $table->dropColumn('statut');
        });
    }
};
