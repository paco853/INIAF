<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AparienciaLaboratorio extends Model
{
    use HasFactory;

    protected $table = 'apariencia_laboratorios';

    protected $fillable = [
        'documento_apariencia_id',
        'numero_laboratorio',
    ];

    public function apariencia(): BelongsTo
    {
        return $this->belongsTo(DocumentoApariencia::class);
    }
}
