<?php

namespace App\Support;

use App\Models\AnalisisDocumento;

class ReportePayload
{
    public static function fromDocumento(AnalisisDocumento $doc): array
    {
        $recepcion = $doc->recepcion ?? [];
        if (!isset($recepcion['origen']) || trim((string) $recepcion['origen']) === '') {
            $recepcion['origen'] = DocumentosHelper::buildOrigen(
                $recepcion['comunidad'] ?? null,
                $recepcion['municipio'] ?? null,
            );
        }

        $humedad = $doc->humedad ?? [];
        $semillera = self::resolveSemillera($doc, $recepcion);
        $fechaEvaluacion = $doc->fecha_evaluacion;
        $fechaLegible = $fechaEvaluacion?->format('d/m/Y');

        return [
            'doc' => [
                'id' => $doc->id,
                'nlab' => $doc->nlab ?? ($recepcion['nlab'] ?? null),
                'especie' => $doc->especie ?? ($recepcion['especie'] ?? null),
                'estado' => $doc->estado,
                'validez' => $doc->validez,
                'observaciones' => $doc->observaciones,
                'malezas_nocivas' => $doc->malezas_nocivas,
                'malezas_comunes' => $doc->malezas_comunes,
                'fecha_evaluacion' => $fechaEvaluacion?->format('Y-m-d'),
                'fecha_evaluacion_legible' => $fechaLegible,
            ],
            'recepcion' => $recepcion,
            'humedad' => $humedad,
            'semillera' => $semillera,
            'fecha_evaluacion_legible' => $fechaLegible,
        ];
    }

    protected static function resolveSemillera(AnalisisDocumento $doc, array $recepcion): ?string
    {
        $semillera = $recepcion['semillera'] ?? $doc->semillera ?? null;
        if (is_string($semillera)) {
            $semillera = trim($semillera);
        }
        if ($semillera === '' || $semillera === null) {
            $fallback = $recepcion['cooperador'] ?? $doc->cooperador ?? null;
            $semillera = is_string($fallback) ? trim($fallback) : $fallback;
        }

        return $semillera ?: null;
    }
}
