<?php

namespace App\Support;

use App\Models\AnalisisDocumento;
use App\Support\ReportePayload;

class ReporteContextBuilder
{
    public static function build(AnalisisDocumento $doc, bool $isPreview): array
    {
        $payload = ReportePayload::fromDocumento($doc);
        $r = $payload['recepcion'];
        $h = $payload['humedad'];
        $semillera = $payload['semillera'];
        $fechaEv = $payload['fecha_evaluacion_legible'];
        $fmt = static function ($value, $default = '-') {
            return isset($value) && $value !== '' ? $value : $default;
        };

        $img = function (string $path) use ($isPreview) {
            if ($isPreview) {
                return asset($path);
            }
            $abs = public_path($path);
            if (is_file($abs) && is_readable($abs)) {
                $ext = strtolower(pathinfo($abs, PATHINFO_EXTENSION));
                $mime = match ($ext) {
                    'png' => 'image/png',
                    'jpg', 'jpeg' => 'image/jpeg',
                    'gif' => 'image/gif',
                    'svg' => 'image/svg+xml',
                    default => 'application/octet-stream'
                };
                $data = @file_get_contents($abs);
                if ($data !== false) {
                    return 'data:'.$mime.';base64,'.base64_encode($data);
                }
            }
            return asset($path);
        };

        return [
            'doc' => $doc,
            'isPreview' => $isPreview,
            'r' => $r,
            'h' => $h,
            'fmt' => $fmt,
            'semillera' => $semillera,
            'fechaEv' => $fechaEv,
            'img' => $img,
        ];
    }
}
