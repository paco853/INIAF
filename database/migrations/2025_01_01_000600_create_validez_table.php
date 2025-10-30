<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('validez', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cultivo_id')->constrained('cultivos')->cascadeOnDelete();
            $table->unsignedInteger('dias');
            $table->timestamps();
            $table->unique('cultivo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('validez');
    }
};

