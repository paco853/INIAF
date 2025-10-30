<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cultivos', function (Blueprint $table) {
            $table->string('categoria_inicial')->nullable()->after('especie');
            $table->string('categoria_final')->nullable()->after('categoria_inicial');
        });
    }

    public function down(): void
    {
        Schema::table('cultivos', function (Blueprint $table) {
            $table->dropColumn(['categoria_inicial', 'categoria_final']);
        });
    }
};

