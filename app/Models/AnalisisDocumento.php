<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalisisDocumento extends Model
{
    use HasFactory;

    protected $fillable = [
        'nlab',
        'especie',
        'fecha_evaluacion',
        'estado',
        'validez',
        'observaciones',
        'malezas_nocivas',
        'malezas_comunes',
        'recepcion',
        'humedad',
        'datos',
    ];

    protected $casts = [
        'fecha_evaluacion' => 'date',
        'recepcion' => 'array',
        'humedad' => 'array',
        'datos' => 'array',
    ];
}

