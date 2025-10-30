<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Variedad extends Model
{
    use HasFactory;

    // Eloquent pluralizes "Variedad" -> "variedads" por defecto; forzamos el nombre correcto
    protected $table = 'variedades';

    protected $fillable = [
        'cultivo_id',
        'nombre',
    ];

    public function cultivo()
    {
        return $this->belongsTo(Cultivo::class);
    }
}
