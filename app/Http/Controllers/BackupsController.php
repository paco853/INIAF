<?php

namespace App\Http\Controllers;

use App\Models\Cultivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BackupsController extends Controller
{
    public function export()
    {
        // Mantener compatibilidad: descarga inmediata del último backup generado (si existe)
        $files = Storage::files('backups');
        if (empty($files)) {
            abort(404, 'No hay backups disponibles.');
        }
        rsort($files);
        $latest = $files[0];
        $stream = Storage::readStream($latest);
        $filename = basename($latest);

        return response()->streamDownload(function () use ($stream) {
            fpassthru($stream);
        }, $filename, ['Content-Type' => 'application/json']);
    }

    public function generate(Request $request)
    {
        $cultivos = Cultivo::with(['variedades', 'validez'])->orderBy('id')->get();

        $data = $cultivos->map(function ($c) {
            $variedades = collect($c->variedades ?? [])
                ->flatMap(function ($variedad) {
                    $raw = (string) ($variedad->nombre ?? '');
                    return collect(preg_split('/\r\n|\n|\r/', $raw));
                })
                ->map(fn ($nombre) => trim($nombre))
                ->filter()
                ->unique()
                ->values()
                ->all();

            return [
                'id' => $c->id,
                'especie' => $c->especie,
                'categoria_inicial' => $c->categoria_inicial,
                'categoria_final' => $c->categoria_final,
                'dias' => $c->validez->dias ?? null,
                'variedades' => $variedades,
            ];
        })->values();

        $payload = [
            'app' => 'registro_semillas',
            'version' => 1,
            'generated_at' => now()->toIso8601String(),
            'data' => [
                'cultivos' => $data,
            ],
        ];

        $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $filename = 'backup_cultivos_variedades_' . now()->format('Ymd_His') . '.json';

        Storage::put('backups/'.$filename, $json);

        return redirect()->route('ui.backups')->with('status', 'Backup generado: '.$filename);
    }

    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimetypes:application/json,text/plain', 'max:10240'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $contents = (string) file_get_contents($request->file('file')->getRealPath());
        $payload = json_decode($contents, true);

        if (!is_array($payload)) {
            return back()->withErrors(['file' => 'El archivo no tiene un JSON válido.'])->withInput();
        }

        $cultivos = data_get($payload, 'data.cultivos');
        if (!is_array($cultivos)) {
            return back()->withErrors(['file' => 'El archivo no contiene cultivos válidos.'])->withInput();
        }

        foreach ($cultivos as $idx => $c) {
            if (!is_array($c)) {
                return back()->withErrors(['file' => "Cultivo #$idx no es válido."])->withInput();
            }
            if (empty($c['especie'])) {
                return back()->withErrors(['file' => "Cultivo #$idx: el campo especie es obligatorio."])->withInput();
            }
        }

        DB::transaction(function () use ($cultivos) {
            try {
                DB::statement('TRUNCATE TABLE variedades, validez, cultivos RESTART IDENTITY CASCADE');
            } catch (\Throwable $e) {
                DB::table('variedades')->delete();
                DB::table('validez')->delete();
                DB::table('cultivos')->delete();
            }

            foreach ($cultivos as $c) {
                $especie = Str::upper(trim((string) ($c['especie'] ?? '')));
                $categoriaInicial = trim((string) ($c['categoria_inicial'] ?? ''));
                $categoriaFinal = trim((string) ($c['categoria_final'] ?? ''));
                $dias = $c['dias'] ?? null;
                $now = now();

                $cultivoId = DB::table('cultivos')->insertGetId(array_filter([
                    'id' => $c['id'] ?? null,
                    'especie' => $especie,
                    'categoria_inicial' => $categoriaInicial !== '' ? Str::upper($categoriaInicial) : null,
                    'categoria_final' => $categoriaFinal !== '' ? Str::upper($categoriaFinal) : null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ], fn ($v) => $v !== null));

                if ($dias !== null && $dias !== '') {
                    DB::table('validez')->insert([
                        'cultivo_id' => $cultivoId,
                        'dias' => (int) $dias,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                $variedades = collect($c['variedades'] ?? [])
                    ->map(fn ($v) => Str::upper(trim((string) $v)))
                    ->filter()
                    ->unique(function ($v) {
                        return Str::lower($v);
                    })
                    ->values();

                if ($variedades->isNotEmpty()) {
                    DB::table('variedades')->insert([
                        'cultivo_id' => $cultivoId,
                        'nombre' => $variedades->implode("\n"),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        });

        return redirect()->route('ui.backups')->with('status', 'Backup restaurado correctamente.');
    }

    public function download(Request $request)
    {
        $file = $request->query('file');
        if (!$file || Str::contains($file, ['..', '/'])) {
            abort(404);
        }
        $path = 'backups/'.$file;
        if (!Storage::exists($path)) {
            abort(404);
        }
        $stream = Storage::readStream($path);
        return response()->streamDownload(function () use ($stream) {
            fpassthru($stream);
        }, $file, ['Content-Type' => 'application/json']);
    }

    public function destroy(Request $request)
    {
        $file = $request->input('file');
        if (!$file || Str::contains($file, ['..', '/'])) {
            return back()->withErrors(['file' => 'Archivo inválido']);
        }
        $path = 'backups/'.$file;
        if (Storage::exists($path)) {
            Storage::delete($path);
            return back()->with('status', 'Backup eliminado: '.$file);
        }
        return back()->withErrors(['file' => 'El archivo no existe']);
    }
}
