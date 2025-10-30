<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semilla extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo', 'especie', 'variedad', 'lote', 'procedencia',
        'fecha_recepcion', 'peso', 'created_by',
    ];
}

