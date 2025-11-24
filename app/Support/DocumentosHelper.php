<?php

namespace App\Support;

use Illuminate\Support\Str;

class DocumentosHelper
{
    public static function buildOrigen(?string $comunidad, ?string $municipio): string
    {
        $parts = [];
        $com = trim((string) $comunidad);
        $mun = trim((string) $municipio);
        if ($com !== '') {
            $parts[] = Str::upper($com);
        }
        if ($mun !== '') {
            $parts[] = Str::upper($mun);
        }
        return implode(', ', $parts);
    }
}
