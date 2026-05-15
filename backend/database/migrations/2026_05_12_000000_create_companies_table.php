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
            $table->string('nom', 191);
            $table->string('nom_commercial', 191)->nullable();
            $table->string('adresse', 255)->nullable();
            $table->string('ville', 100)->nullable();
            $table->string('code_postal', 20)->nullable();
            $table->string('pays', 100)->nullable();
            $table->string('telephone', 50)->nullable();
            $table->string('email', 191)->nullable();
            $table->string('ice', 100)->nullable();
            $table->string('registre_commerce', 100)->nullable();
            $table->string('devise', 10)->nullable();
            $table->string('langue', 10)->nullable();
            $table->string('logo_path', 255)->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
          
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
