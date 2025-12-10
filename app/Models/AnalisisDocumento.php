<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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

    /**
     * Syncs the Postgres serial sequence with the current max id so next inserts do not conflict.
     */
    public static function syncIdSequence(): void
    {
        $connection = DB::connection();
        if ($connection->getDriverName() !== 'pgsql') {
            return;
        }

        $model = new static();
        $table = $model->getTable();
        $key = $model->getKeyName();

        $sequenceRow = $connection->selectOne(
            'SELECT pg_get_serial_sequence(?, ?) AS seq',
            [$table, $key]
        );
        $sequence = $sequenceRow?->seq;
        if (!is_string($sequence) || $sequence === '') {
            return;
        }

        $maxValue = $connection->table($table)->max($key);
        $nextValue = $maxValue !== null ? (int) $maxValue : 0;

        $connection->statement("SELECT setval('{$sequence}', ?, true)", [$nextValue]);
    }
}
