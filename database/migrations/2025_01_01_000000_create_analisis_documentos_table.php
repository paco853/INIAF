<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('analisis_documentos', function (Blueprint $table) {
            $table->id();
            $table->string('nlab', 50)->nullable();
            $table->string('especie', 150)->nullable();
            $table->date('fecha_evaluacion')->nullable();
            $table->string('estado', 20)->nullable();
            $table->string('validez', 100)->nullable();
            $table->text('observaciones')->nullable();
            $table->string('malezas_nocivas', 255)->nullable();
            $table->string('malezas_comunes', 255)->nullable();
            $table->json('recepcion')->nullable();
            $table->json('humedad')->nullable();
            $table->json('datos')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analisis_documentos');
    }
};

