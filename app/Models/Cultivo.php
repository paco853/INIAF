<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cultivo extends Model
{
    use HasFactory;

    protected $fillable = ['especie', 'categoria_inicial', 'categoria_final'];

    public function variedades()
    {
        return $this->hasMany(\App\Models\Variedad::class);
    }

    public function validez()
    {
        return $this->hasOne(\App\Models\Validez::class);
    }
}
