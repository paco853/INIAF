<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('documento_apariencias', function (Blueprint $table) {
            $table->id();
            $table->string('logo_left_path', 255)->nullable();
            $table->string('logo_right_path', 255)->nullable();
            $table->text('footer_text')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documento_apariencias');
    }
};
