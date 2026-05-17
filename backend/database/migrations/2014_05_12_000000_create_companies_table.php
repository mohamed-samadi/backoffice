<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
Schema::create('companies', function (Blueprint $table) {
    $table->id();

    // Basic info
    $table->string('nom');
    $table->string('nom_commercial')->nullable();

    // Contact
    $table->string('email')->nullable()->unique();
    $table->string('telephone', 30)->nullable();

    // Address
    $table->string('adresse')->nullable();
    $table->string('ville', 100)->nullable();
    $table->string('code_postal', 20)->nullable();
    $table->string('pays', 100)->default('Maroc');

    // Legal info
    $table->string('ice', 50)->nullable()->unique();
    $table->string('registre_commerce', 50)->nullable()->unique();
    $table->string('identifiant_fiscal', 50)->nullable()->unique(); // IF (added)


    // Branding
    $table->string('')->nullable();

    // Status
    $table->boolean('is_active')->default(true);

    $table->timestamps();

    // Indexes (performance )
    $table->index(['nom']);
    $table->index(['ville']);
});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('companies');
    }
}
