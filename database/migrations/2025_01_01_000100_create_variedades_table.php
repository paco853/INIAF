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
            $table->string('nombre');
            $table->timestamps();

            $table->index(['cultivo_id', 'nombre']);
            $table->index('nombre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('variedades');
    }
};
