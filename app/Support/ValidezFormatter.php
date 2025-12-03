<?php

namespace App\Support;

class ValidezFormatter
{
    private const UNIT_LABELS = [
        'DIAS' => ['singular' => 'DÍA', 'plural' => 'DÍAS'],
        'MESES' => ['singular' => 'MES', 'plural' => 'MESES'],
        'ANIOS' => ['singular' => 'AÑO', 'plural' => 'AÑOS'],
    ];

    public static function format(?int $cantidad = null, ?string $unidad = null, ?int $dias = null): ?string
    {
        $value = static::fromCantidadUnidad($cantidad, $unidad);
        if ($value !== null) {
            return $value;
        }
        return static::fromDias($dias);
    }

    private static function fromCantidadUnidad(?int $cantidad, ?string $unidad): ?string
    {
        if ($cantidad === null || $cantidad < 0 || $unidad === null) {
            return null;
        }

        $upperUnit = strtoupper($unidad);
        $labels = static::UNIT_LABELS[$upperUnit] ?? null;
        if (!$labels) {
            return null;
        }

        $label = $cantidad === 1 ? $labels['singular'] : $labels['plural'];
        return "{$cantidad} {$label}";
    }

    public static function fromDias(?int $dias): ?string
    {
        if (!$dias || $dias <= 0) {
            return null;
        }
        return $dias === 1 ? '1 DÍA' : "{$dias} DÍAS";
    }
}
