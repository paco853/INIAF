<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use App\Models\Cultivo;
use App\Models\AnalisisDocumento;
use App\Support\ValidezFormatter;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AnalisisSemillasController extends Controller
{
    public function show(): View
    {
        $cultivos = \App\Models\Cultivo::orderBy('especie')
            ->get(['id','especie','categoria_inicial','categoria_final']);
        return view('analisis_semillas', [
            'today' => now()->format('Y-m-d'),
            'cultivos' => $cultivos,
        ]);
    }

    public function compute(Request $request): JsonResponse
    {
        $data = $request->validate([
            'especie' => ['nullable', 'string', 'max:150'],
            'cooperador' => ['nullable', 'string', 'max:150'],
            'nlab' => ['nullable', 'string', 'max:50'],
            'bolsas' => ['nullable', 'numeric'],
            'kgbol' => ['nullable', 'numeric'],
            'anio' => ['nullable', 'integer', 'min:1900', 'max:2100'],
        ]);

        $especie = $data['especie'] ?? '';
        $cooperador = $data['cooperador'] ?? '';
        $nlab = $data['nlab'] ?? '';
        $bolsas = (float) ($data['bolsas'] ?? 0);
        $kgbol = (float) ($data['kgbol'] ?? 0);
        $anioValue = $this->normalizeYear($data['anio'] ?? null);

        $lote = $this->generateLote($cooperador, $nlab, $especie, $anioValue);
        $total = $bolsas * $kgbol;

        return response()->json([
            'lote' => $lote,
            'total' => is_finite($total) ? number_format($total, 2, '.', '') : null,
        ]);
    }

    public function humidity(): InertiaResponse
    {
        $validezDefault = null;
        try {
            $recep = session()->get('analisis.recepcion', []);
            $esp = trim((string)($recep['especie'] ?? ''));
            if ($esp !== '') {
                $cultivo = \App\Models\Cultivo::whereRaw('LOWER(especie) = ?', [Str::lower($esp)])
                    ->first();
                if ($cultivo && $cultivo->validez) {
                    $validezDefault = ValidezFormatter::format(
                        $cultivo->validez->cantidad,
                        $cultivo->validez->unidad,
                        $cultivo->validez->dias,
                    );
                }
            }
        } catch (\Throwable $e) { /* silent */ }

        $humedad = session()->get('analisis.humedad', []);
        $recepcion = session()->get('analisis.recepcion', []);
        $prepared = $this->prepareHumedadData($humedad, $recepcion, $validezDefault, now()->format('Y-m-d'));

        return Inertia::render('Analisis/Humedad', [
            'today' => now()->format('Y-m-d'),
            'validezDefault' => $validezDefault,
            'humedad' => $prepared,
            'recepcion' => $recepcion,
        ]);
    }

    // purity() eliminado: datos generales integrados en registro_semillas

    public function othersSeeds(): View
    {
        return view('analisis_otras_semillas');
    }

    public function submitRecepcion(Request $request)
    {
        $anioForUnique = $this->normalizeYear($request->input('anio'));
        $nlabUniqueRule = Rule::unique('analisis_documentos', 'nlab')
            ->where(function ($query) use ($anioForUnique) {
                if ($anioForUnique === null) {
                    $query->whereNull('recepcion->anio');
                } else {
                    $query->where('recepcion->anio', $anioForUnique);
                }
            });

        $data = $request->validate([
            'nlab' => ['required','string','max:50', $nlabUniqueRule],
            'especie' => ['required','string','max:150'],
            // 'latin' removido del formulario
            'variedad' => ['nullable','string','max:150'],
            'semillera' => ['nullable','string','max:150'],
            'cooperador' => ['nullable','string','max:150'],
            'categoria_inicial' => ['nullable','string','max:100'],
            'categoria_final' => ['nullable','string','max:100'],
            // 'campo' removido del formulario
            'lote' => ['required','string','max:100'],
            'bolsas' => ['nullable','numeric','min:0'],
            'kgbol' => ['nullable','numeric','min:0'],
            // 'total' se calcula automáticamente
            'fecha' => ['nullable','date'],
            'anio' => ['nullable','integer','min:1900','max:2100'],
            'municipio' => ['nullable','string','max:150'],
            'comunidad' => ['nullable','string','max:150'],
            'aut_import' => ['nullable','string','max:150'],
        ], [
            'nlab.unique' => 'Este número de laboratorio ya existe para la campaña indicada.',
        ]);

        // Calcular automáticamente campos derivados
        $aut = trim((string)($data['aut_import'] ?? ''));
        $data['aut_import'] = ($aut === '') ? 'NINGUNO' : $aut;
        // latin removido del formulario
        $anioValue = $this->normalizeYear($data['anio'] ?? null);
        if ($anioValue !== null) {
            $data['anio'] = $anioValue;
        } else {
            unset($data['anio']);
        }
        $inputLote = trim((string) ($data['lote'] ?? ''));
        $data['lote'] = $inputLote !== ''
            ? Str::upper($inputLote)
            : $this->generateLote($data['cooperador'] ?? '', $data['nlab'] ?? '', $data['especie'] ?? '', $anioValue);
        $bolsas = (float)($data['bolsas'] ?? 0);
        $kgbol = (float)($data['kgbol'] ?? 0);
        $data['total'] = $bolsas * $kgbol;
        $data['origen'] = $this->formatOrigen($data['comunidad'] ?? '', $data['municipio'] ?? '');

        // Limpiar sesión del flujo y volver al formulario limpio
        $request->session()->forget(['analisis.recepcion', 'analisis.humedad']);
        // removed early redirect;

        // Persist provisionalmente en sesión para siguientes pasos
        $request->session()->put('analisis.recepcion', $data);

        // Redirige al siguiente paso
        return redirect()->route('analisis.humedad');
    }

    public function submitHumidity(Request $request)
    {
        $data = $request->validate(
            [
                'resultado' => ['nullable','numeric','min:0'],
                'otros_sp_pct' => ['nullable','numeric','min:0','max:100'],
                'otros_sp_kg' => ['nullable','numeric','min:0'],
                'otros_cultivos_pct' => ['nullable','numeric','min:0','max:100'],
                'otros_cultivos_kg' => ['nullable','numeric','min:0'],
                'malezas_comunes_pct' => ['nullable','numeric','min:0','max:100'],
                'malezas_comunes_kg' => ['nullable','numeric','min:0'],
                'malezas_prohibidas_pct' => ['nullable','numeric','min:0','max:100'],
                'malezas_prohibidas_kg' => ['nullable','numeric','min:0'],
                'germinacion_pct' => ['nullable','numeric','min:0','max:100'],
                'viabilidad_pct' => ['nullable','numeric','min:0','max:100'],
                'variavilidad_pct' => ['nullable','numeric','min:0','max:100'],
            ],
            [
                'germinacion_pct.max' => 'La germinación no debe ser mayor a 100.',
                'viabilidad_pct.max' => 'La viabilidad no debe ser mayor a 100.',
            ]
        );

        $data['viabilidad_pct'] = $request->has('viabilidad_pct')
            ? ($data['viabilidad_pct'] ?? null)
            : ($data['variavilidad_pct'] ?? null);
        unset($data['variavilidad_pct']);

        $request->session()->put('analisis.humedad', $data);

        return redirect()->route('analisis.pureza');
    }

    public function finalize(Request $request)
    {
        $datos = $request->validate(
            [
                'fecha' => ['nullable','date'],
                'estado' => ['required','in:APROBADO,RECHAZADO'],
                'validez' => ['nullable','string','max:100'],
                'observaciones' => ['nullable','string'],
                'malezas_nocivas' => ['nullable','string','max:255'],
                'malezas_comunes' => ['nullable','string','max:255'],
                // Campos de humedad opcionales
                'resultado' => ['nullable','numeric','min:0'],
                'otros_sp_pct' => ['nullable','numeric','min:0','max:100'],
                'otros_sp_kg' => ['nullable','numeric','min:0'],
                'otros_cultivos_pct' => ['nullable','numeric','min:0','max:100'],
                'otros_cultivos_kg' => ['nullable','numeric','min:0'],
                'malezas_comunes_pct' => ['nullable','numeric','min:0','max:100'],
                'malezas_comunes_kg' => ['nullable','numeric','min:0'],
                'malezas_prohibidas_pct' => ['nullable','numeric','min:0','max:100'],
                'malezas_prohibidas_kg' => ['nullable','numeric','min:0'],
                'germinacion_pct' => ['nullable','numeric','min:0','max:100'],
                'viabilidad_pct' => ['nullable','numeric','min:0','max:100'],
                'variavilidad_pct' => ['nullable','numeric','min:0','max:100'],
            ],
            [
                'germinacion_pct.max' => 'La germinación no debe ser mayor a 100.',
                'viabilidad_pct.max' => 'La viabilidad no debe ser mayor a 100.',
            ]
        );

        $datos['viabilidad_pct'] = $request->has('viabilidad_pct')
            ? ($datos['viabilidad_pct'] ?? null)
            : ($datos['variavilidad_pct'] ?? null);
        unset($datos['variavilidad_pct']);

        $recepcion = $request->session()->get('analisis.recepcion', []);
        // Si no hay humedad en sesión, construirla desde este request
        $humedad = $request->session()->get('analisis.humedad', []);
        if (array_key_exists('variavilidad_pct', $humedad) && !array_key_exists('viabilidad_pct', $humedad)) {
            $humedad['viabilidad_pct'] = $humedad['variavilidad_pct'];
        }
        unset($humedad['variavilidad_pct']);
        if (empty($humedad)) {
            $humedad = [
                'resultado' => $datos['resultado'] ?? null,
                'otros_sp_pct' => $datos['otros_sp_pct'] ?? null,
                'otros_sp_kg' => $datos['otros_sp_kg'] ?? null,
                'otros_cultivos_pct' => $datos['otros_cultivos_pct'] ?? null,
                'otros_cultivos_kg' => $datos['otros_cultivos_kg'] ?? null,
                'malezas_comunes_pct' => $datos['malezas_comunes_pct'] ?? null,
                'malezas_comunes_kg' => $datos['malezas_comunes_kg'] ?? null,
                'malezas_prohibidas_pct' => $datos['malezas_prohibidas_pct'] ?? null,
                'malezas_prohibidas_kg' => $datos['malezas_prohibidas_kg'] ?? null,
                'germinacion_pct' => $datos['germinacion_pct'] ?? null,
                'viabilidad_pct' => $datos['viabilidad_pct'] ?? null,
            ];
        }

        $nlab = $recepcion['nlab'] ?? null;
        $especie = $recepcion['especie'] ?? null;
        $recepcion['origen'] = $this->formatOrigen($recepcion['comunidad'] ?? '', $recepcion['municipio'] ?? '');

        $nlabNormalized = trim((string) ($nlab ?? ''));
        $nlabNormalized = $nlabNormalized === '' ? null : Str::upper($nlabNormalized);
        $anioForMatch = $this->normalizeYear((string) ($recepcion['anio'] ?? ''));
        $recepcion['anio'] = $anioForMatch;

        $docPayload = [
            'nlab' => $nlab,
            'especie' => $especie,
            'fecha_evaluacion' => $datos['fecha'] ?? null,
            'estado' => $datos['estado'] ?? null,
            'validez' => $datos['validez'] ?? null,
            'observaciones' => $datos['observaciones'] ?? null,
            'malezas_nocivas' => $datos['malezas_nocivas'] ?? null,
            'malezas_comunes' => $datos['malezas_comunes'] ?? null,
            'recepcion' => $recepcion ?: null,
            'humedad' => $humedad ?: null,
            'datos' => $datos ?: null,
        ];

        $existingDoc = null;
        if ($nlabNormalized !== null) {
            $query = AnalisisDocumento::query()
                ->whereRaw('UPPER(nlab) = ?', [$nlabNormalized]);
            if ($anioForMatch === null) {
                $query->whereNull('recepcion->anio');
            } else {
                $query->where('recepcion->anio', $anioForMatch);
            }
            $existingDoc = $query->orderByDesc('id')->first();
        }

        if ($existingDoc) {
            $existingDoc->fill($docPayload);
            $existingDoc->save();
            $doc = $existingDoc;
            $statusMessage = 'Documento #'.$doc->id.' actualizado';
        } else {
            try {
                $doc = AnalisisDocumento::create($docPayload);
            } catch (QueryException $e) {
                if ($this->shouldRetryAfterSequenceSync($e)) {
                    AnalisisDocumento::syncIdSequence();
                    $doc = AnalisisDocumento::create($docPayload);
                } else {
                    throw $e;
                }
            }
            $statusMessage = 'Documento #'.$doc->id.' creado';
        }

        // limpiar sesión del flujo
        $request->session()->forget(['analisis.recepcion', 'analisis.humedad']);

        return redirect()->route('documentos.index')->with('status', $statusMessage);
    }

    private function shouldRetryAfterSequenceSync(QueryException $exception): bool
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return false;
        }

        if ($exception->getCode() !== '23505') {
            return false;
        }

        $detail = $exception->errorInfo[2] ?? '';
        return str_contains((string) $detail, 'analisis_documentos_pkey');
    }

    private function latinFromEspecie(?string $especie): string
    {
        $key = strtolower(Str::ascii(trim((string) $especie)));
        $map = [
            'maiz' => 'Zea mays',
            'soya' => 'Glycine max',
            'soja' => 'Glycine max',
            'trigo' => 'Triticum aestivum',
            'arroz' => 'Oryza sativa',
            'papa' => 'Solanum tuberosum',
            'quinua' => 'Chenopodium quinoa',
            'quinoa' => 'Chenopodium quinoa',
            'cebada' => 'Hordeum vulgare',
            'avena' => 'Avena sativa',
            'girasol' => 'Helianthus annuus',
            'mani' => 'Arachis hypogaea',
            'frijol' => 'Phaseolus vulgaris',
            'poroto' => 'Phaseolus vulgaris',
            'arveja' => 'Pisum sativum',
            'tomate' => 'Solanum lycopersicum',
            'pimiento' => 'Capsicum annuum',
            'sorgo' => 'Sorghum bicolor',
            'algodon' => 'Gossypium hirsutum',
        ];

        if ($key !== '' && isset($map[$key])) {
            return $map[$key];
        }

        return $especie ? ucfirst(trim($especie)) : '';
    }

    private function prepareHumedadData(array $humedad, array $recepcion, ?string $validezDefault, string $today): array
    {
        $fallbackNocivas = "EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS NOCIVAS O PROHIBIDAS";
        $fallbackComunes = "EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS COMUNES";

        $viabilidad = $humedad['viabilidad_pct'] ?? $humedad['variavilidad_pct'] ?? null;

        $prepared = [
            'resultado' => $this->normalizeNumericInput($humedad['resultado'] ?? null),
            'otros_sp_pct' => $this->normalizeNumericInput($humedad['otros_sp_pct'] ?? null),
            'otros_sp_kg' => $this->normalizeNumericInput($humedad['otros_sp_kg'] ?? null),
            'otros_cultivos_pct' => $this->normalizeNumericInput($humedad['otros_cultivos_pct'] ?? null),
            'otros_cultivos_kg' => $this->normalizeNumericInput($humedad['otros_cultivos_kg'] ?? null),
            'malezas_comunes_pct' => $this->normalizeNumericInput($humedad['malezas_comunes_pct'] ?? null),
            'malezas_comunes_kg' => $this->normalizeNumericInput($humedad['malezas_comunes_kg'] ?? null),
            'malezas_prohibidas_pct' => $this->normalizeNumericInput($humedad['malezas_prohibidas_pct'] ?? null),
            'malezas_prohibidas_kg' => $this->normalizeNumericInput($humedad['malezas_prohibidas_kg'] ?? null),
            'germinacion_pct' => $this->normalizeNumericInput($humedad['germinacion_pct'] ?? null),
            'viabilidad_pct' => $this->normalizeNumericInput($viabilidad),
            'estado' => $this->normalizeTextValue($humedad['estado'] ?? ''),
            'validez' => $this->normalizeTextValue($humedad['validez'] ?? $validezDefault ?? ''),
            'fecha' => $humedad['fecha'] ?? $today,
            'observaciones' => $this->normalizeTextValue($humedad['observaciones'] ?? ''),
            'malezas_nocivas' => $this->sanitizeMalezaText(
                $this->chooseMalezaFallback($humedad['malezas_nocivas'] ?? null, $fallbackNocivas),
                $fallbackNocivas,
            ),
            'malezas_comunes' => $this->sanitizeMalezaText(
                $this->chooseMalezaFallback($humedad['malezas_comunes'] ?? null, $fallbackComunes),
                $fallbackComunes,
            ),
        ];

        if ($prepared['otros_sp_pct'] === '') {
            $prepared['otros_sp_pct'] = '100';
        }

        return $prepared;
    }

    private function normalizeNumericInput($value): string
    {
        if ($value === null) {
            return '';
        }
        $str = trim((string) $value);
        if ($str === '') {
            return '';
        }
        return is_numeric($str) ? $str : '';
    }

    private function normalizeTextValue(?string $value): string
    {
        $trimmed = trim((string) ($value ?? ''));
        return $trimmed === '' ? '' : Str::upper($trimmed);
    }

    private function chooseMalezaFallback(?string $value, string $fallback): string
    {
        $trimmed = trim((string) ($value ?? ''));
        if ($trimmed === '' || $trimmed === '-') {
            return $fallback;
        }
        return Str::upper($trimmed);
    }

    private function sanitizeMalezaText(string $value, string $fallbackPrefix): string
    {
        if ($fallbackPrefix === '') {
            return $value;
        }
        if (!str_starts_with($value, $fallbackPrefix)) {
            return $value;
        }
        return trim(preg_replace('/\s*\([^)]*\)$/', '', $value));
    }

    private function normalizeYear(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        $trimmed = trim((string) $value);
        return preg_match('/^\d{4}$/', $trimmed) ? $trimmed : null;
    }

    private function generateLote(?string $cooperador, ?string $nlab, ?string $especie, ?string $year = null): string
    {
        $ini = collect(preg_split('/\s+/', (string) $cooperador, -1, PREG_SPLIT_NO_EMPTY))
            ->map(fn($w) => Str::upper(Str::substr($w, 0, 1)))
            ->implode('');
        $lab = trim((string) $nlab);
        $eIni = Str::upper(Str::substr(trim((string) $especie), 0, 1));
        $yearValue = trim((string) ($year ?? ''));
        $parts = [$ini, $lab, $eIni];
        if ($yearValue !== '') {
            $parts[] = $yearValue;
        }
        return collect($parts)
            ->filter(fn($v) => $v !== '')
            ->implode('-');
    }

    private function formatOrigen(?string $comunidad, ?string $municipio): string
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

    /**
     * Devuelve sugerencias de especies de cultivos para autocompletar.
     */
    public function suggestEspecies(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        $limit = (int) $request->query('limit', 10);
        if ($limit < 1) { $limit = 1; }
        if ($limit > 50) { $limit = 50; }

        $items = Cultivo::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where('especie', 'like', '%'.$q.'%');
            })
            ->orderBy('especie')
            ->limit($limit)
            ->get(['id', 'especie', 'categoria_inicial', 'categoria_final']);

        return response()->json([
            'items' => $items,
        ]);
    }

    /**
     * Devuelve sugerencias de variedades para una especie dada.
     * Params:
     *  - especie: nombre exacto de la especie (Cultivo.especie)
     *  - q: filtro opcional por nombre de variedad
     *  - limit: cantidad de resultados (1..50, por defecto 20)
     */
    public function suggestVariedades(Request $request): JsonResponse
    {
        $especie = trim((string) $request->query('especie', ''));
        $cultivoId = (int) $request->query('cultivo_id', 0);
        $q = trim((string) $request->query('q', ''));
        $limit = (int) $request->query('limit', 20);
        if ($limit < 1) { $limit = 1; }
        if ($limit > 50) { $limit = 50; }

        $cultivo = null;
        if ($cultivoId > 0) {
            $cultivo = \App\Models\Cultivo::find($cultivoId);
        }
        if (!$cultivo && $especie !== '') {
            // Búsqueda case-insensitive por nombre de especie
            $key = Str::lower($especie);
            $cultivo = \App\Models\Cultivo::whereRaw('LOWER(especie) = ?', [$key])->first();
            if (!$cultivo) {
                $cultivo = \App\Models\Cultivo::where('especie', 'like', '%'.$especie.'%')->orderBy('id')->first();
            }
        }

        if (!$cultivo) {
            return response()->json(['items' => []]);
        }

        $items = \App\Models\Variedad::query()
            ->where('cultivo_id', $cultivo->id)
            ->when($q !== '', function ($query) use ($q) {
                $query->where('nombre', 'like', '%'.$q.'%');
            })
            ->orderBy('nombre')
            ->limit($limit)
            ->get(['id', 'nombre']);

        return response()->json([
            'items' => $items,
        ]);
    }

    /**
     * Limpia la sesión del flujo de análisis para iniciar un nuevo registro.
     */
    public function reset(Request $request): JsonResponse
    {
        $request->session()->forget(['analisis.recepcion', 'analisis.humedad']);
        return response()->json(['status' => 'ok']);
    }
}




