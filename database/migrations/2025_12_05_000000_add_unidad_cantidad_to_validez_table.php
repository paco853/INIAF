<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('validez', function (Blueprint $table) {
            $table->string('unidad', 10)->default('DIAS')->after('dias');
            $table->unsignedInteger('cantidad')->nullable()->after('unidad');
        });
    }

    public function down(): void
    {
        Schema::table('validez', function (Blueprint $table) {
            $table->dropColumn(['unidad', 'cantidad']);
        });
    }
};
