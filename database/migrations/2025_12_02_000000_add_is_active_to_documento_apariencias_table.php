<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('documento_apariencias', function (Blueprint $table) {
            $table->boolean('is_active')->default(false)->after('footer_text');
        });
    }

    public function down(): void
    {
        Schema::table('documento_apariencias', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
