<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_ignores', function (Blueprint $table) {
            $table->id();
            $table->string('alert_key')->unique(); // ex: cheque:cheque_id:5
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_ignores');
    }
};