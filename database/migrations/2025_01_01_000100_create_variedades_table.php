<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('variedades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cultivo_id')->constrained('cultivos')->cascadeOnDelete();
            $table->string('categoria_inicial');
            $table->string('categoria_final');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variedades');
    }
};

