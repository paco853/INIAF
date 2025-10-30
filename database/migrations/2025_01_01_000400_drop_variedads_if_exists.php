<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Por si se creó una tabla incorrecta por pluralización ("variedads")
        Schema::dropIfExists('variedads');
    }

    public function down(): void
    {
        // No se restaura la tabla obsoleta
    }
};

