<?php

namespace App\Support;

class ValidezFormatter
{
    public static function fromDias(?int $dias): ?string
    {
        if (!$dias || $dias <= 0) {
            return null;
        }
        if ($dias % 365 === 0) {
            $years = (int) ($dias / 365);
            return $years === 1 ? '1 año' : "{$years} AÑOS";
        }
        if ($dias % 30 === 0) {
            $months = (int) ($dias / 30);
            return $months === 1 ? '1 mes' : "{$months} MESES";
        }
        return $dias === 1 ? '1 día' : "{$dias} DIAS";
    }
}
