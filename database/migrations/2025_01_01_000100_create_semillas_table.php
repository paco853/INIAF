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
        Schema::create('semillas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->string('especie');
            $table->string('variedad')->nullable();
            $table->string('lote')->nullable();
            $table->string('procedencia')->nullable();
            $table->date('fecha_recepcion')->nullable();
            $table->decimal('peso', 10, 2)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('semillas');
    }
};

