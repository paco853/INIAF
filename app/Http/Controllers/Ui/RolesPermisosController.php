<?php

namespace App\Http\Controllers\Ui;

use App\Http\Controllers\Controller;
use App\Models\PermissionSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class RolesPermisosController extends Controller
{
    private const KEY = 'access_config';

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!$request->user() || !$request->user()->is_admin) {
                abort(403, 'Solo administradores.');
            }
            return $next($request);
        });
    }

    public function index(Request $request): InertiaResponse
    {
        $config = PermissionSetting::where('key', self::KEY)->first();
        $toggles = $config?->value ?? $this->defaults();

        return Inertia::render('Config/RolesPermisos/Index', [
            'toggles' => $toggles,
            'roleLabel' => $request->user()?->name ?? 'Admin',
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'toggles' => ['required', 'array'],
        ]);

        PermissionSetting::updateOrCreate(
            ['key' => self::KEY],
            ['value' => $data['toggles']]
        );
        \App\Support\AccessConfig::forget();

        return redirect()->route('ui.roles-permisos')->with('status', 'Permisos actualizados');
    }

    private function defaults(): array
    {
        return [
            'deleteDocs' => false,
            'manageCatalogs' => false,
            'exportData' => false,
            'restoreData' => false,
            'deleteBackups' => false,
        ];
    }
}
