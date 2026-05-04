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
        // Cheques relationship clarification:
        // - cheque.payment_id is the primary foreign key (links to payment)
        // - cheque.client_id is optional/denormalized for performance
        // Indexes are already created by add_indexes_to_tables migration
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op - indexes are managed by add_indexes_to_tables
    }
};
