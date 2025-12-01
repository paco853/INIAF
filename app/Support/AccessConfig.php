<?php

namespace App\Support;

use App\Models\PermissionSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Contracts\Auth\Authenticatable;

class AccessConfig
{
    private const CACHE_KEY = 'access_config_settings';

    /**
        * Retorna todas las banderas de acceso, combinadas con los defaults.
        */
    public static function all(): array
    {
        return Cache::remember(self::CACHE_KEY, 30, function () {
            $record = PermissionSetting::where('key', 'access_config')->first();
            return array_merge(self::defaults(), $record?->value ?? []);
        });
    }

    /**
        * Determina si un usuario puede usar una bandera.
        * Admin siempre puede; si la bandera está en true permite, si false bloquea.
        */
    public static function allowed(string $key, ?Authenticatable $user): bool
    {
        if ($user && ($user->is_admin ?? false)) {
            return true;
        }
        $all = self::all();
        return isset($all[$key]) ? (bool) $all[$key] : false;
    }

    public static function defaults(): array
    {
        return [
            'deleteDocs' => false,
            'manageCatalogs' => false,
            'exportData' => false,
            'restoreData' => false,
            'deleteBackups' => false,
        ];
    }

    public static function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
