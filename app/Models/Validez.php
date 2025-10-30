<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Validez extends Model
{
    use HasFactory;

    protected $table = 'validez';

    protected $fillable = [
        'cultivo_id',
        'dias',
    ];

    public function cultivo()
    {
        return $this->belongsTo(Cultivo::class);
    }
}

