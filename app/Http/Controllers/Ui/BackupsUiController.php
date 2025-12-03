<?php

namespace App\Http\Controllers\Ui;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class BackupsUiController extends Controller
{
    public function index(): InertiaResponse
    {
        $files = Storage::files('backups');
        rsort($files);
        $currentUserName = optional(auth()->user())->name ?? 'Sistema';

        $backups = collect($files)->map(function ($file) use ($currentUserName) {
            $size = Storage::size($file);
            $timestamp = Storage::lastModified($file);
            return [
                'nombre' => basename($file),
                'creado' => $timestamp ? date('c', $timestamp) : null,
                'size' => $this->humanSize($size),
                'usuario' => $currentUserName,
                'estado' => 'completado',
            ];
        })->values();

        return Inertia::render('Backups/Index', [
            'backups' => $backups,
        ]);
    }

    private function humanSize($bytes): string
    {
        if (!is_numeric($bytes)) return '—';
        $units = ['B','KB','MB','GB','TB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 1).' '.$units[$i];
    }
}
