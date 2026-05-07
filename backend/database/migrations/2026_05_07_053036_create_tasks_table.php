<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {

            $table->id();

            // relation client (nullable)
            $table->foreignId('client_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // relation category (optional but recommended)
            $table->foreignId('task_category_id')
                ->nullable()
                ->constrained('task_categories')
                ->nullOnDelete();

            // optional user assigné
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('title');

            $table->text('notes')->nullable();

            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])
                ->default('normal');

            $table->enum('status', ['todo', 'in_progress', 'completed'])
                ->default('todo');

            $table->date('due_date')->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            // indexes (important performance)
            $table->index(['status', 'priority']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};