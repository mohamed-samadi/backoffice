<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->unsignedBigInteger('fournisseur_id')->nullable();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->decimal('prix_unitaire_ht', 10, 2);
            $table->decimal('tva', 5, 2);
            $table->decimal('prix_revient', 10, 2);
            $table->integer('quantite_stock')->default(0);
            $table->boolean('actif')->default(true);
            $table->string('code_barre')->nullable()->unique();
            $table->string('sku')->nullable()->unique();
            $table->integer('seuil_alerte_stock')->nullable();
            $table->timestamps();
            $table->string('image')->nullable();
            $table->enum('type', ['product', 'service'])->default('product');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('fournisseur_id')->references('id')->on('fournisseurs')->onDelete('set null');
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
