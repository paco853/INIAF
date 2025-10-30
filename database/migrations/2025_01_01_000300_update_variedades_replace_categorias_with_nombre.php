<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('variedades', function (Blueprint $table) {
            // Add nombre
            $table->string('nombre')->after('cultivo_id');
            // Drop old categoria columns if they exist
            if (Schema::hasColumn('variedades', 'categoria_inicial')) {
                $table->dropColumn('categoria_inicial');
            }
            if (Schema::hasColumn('variedades', 'categoria_final')) {
                $table->dropColumn('categoria_final');
            }
        });
    }

    public function down(): void
    {
        Schema::table('variedades', function (Blueprint $table) {
            // Recreate old columns and drop nombre
            $table->string('categoria_inicial')->nullable();
            $table->string('categoria_final')->nullable();
            $table->dropColumn('nombre');
        });
    }
};

