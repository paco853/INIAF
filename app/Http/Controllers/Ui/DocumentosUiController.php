<?php

namespace App\Http\Controllers\Ui;

use App\Http\Controllers\Controller;
use App\Models\AnalisisDocumento;
use App\Models\Cultivo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DocumentosUiController extends Controller
{
    public function bulk(): InertiaResponse
    {
        return Inertia::render('Documentos/Bulk');
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('Documentos/Create');
    }

    public function index(Request $request): InertiaResponse
    {
        $filters = [
            'gestion' => trim((string) $request->query('gestion', '')),
            'nlab' => trim((string) $request->query('nlab', '')),
            'especie' => trim((string) $request->query('especie', '')),
            'estado' => trim((string) $request->query('estado', '')),
            'fecha_desde' => trim((string) $request->query('fecha_desde', '')),
            'fecha_hasta' => trim((string) $request->query('fecha_hasta', '')),
            'anio' => trim((string) $request->query('anio', '')),
        ];

        $query = AnalisisDocumento::query()->orderByDesc('id');

        if ($filters['gestion'] !== '') {
            $query->whereYear('fecha_evaluacion', $filters['gestion']);
        }

        if ($filters['nlab'] !== '') {
            $query->where('nlab', 'like', '%'.$filters['nlab'].'%');
        }

        if ($filters['especie'] !== '') {
            $query->where('especie', 'like', '%'.$filters['especie'].'%');
        }

        if ($filters['estado'] !== '') {
            $query->where('estado', strtoupper($filters['estado']));
        }

        if ($filters['anio'] !== '') {
            $query->where('recepcion->anio', $filters['anio']);
        }

        if ($filters['fecha_desde'] !== '') {
            $query->whereDate('fecha_evaluacion', '>=', $filters['fecha_desde']);
        }

        if ($filters['fecha_hasta'] !== '') {
            $query->whereDate('fecha_evaluacion', '<=', $filters['fecha_hasta']);
        }

        $docs = $query
            ->paginate(20)
            ->through(fn ($doc) => [
                'id' => $doc->id,
                'nlab' => $doc->nlab,
                'especie' => $doc->especie,
                'fecha_evaluacion' => optional($doc->fecha_evaluacion)->format('Y-m-d'),
                'estado' => $doc->estado,
                'validez' => $doc->validez,
                'observaciones' => $doc->observaciones,
                'malezas_nocivas' => $doc->malezas_nocivas,
                'malezas_comunes' => $doc->malezas_comunes,
                'recepcion' => $doc->recepcion ?? [],
                'humedad' => $doc->humedad ?? [],
            ])
            ->withQueryString();

        $species = AnalisisDocumento::query()
            ->select('especie')
            ->whereNotNull('especie')
            ->groupBy('especie')
            ->orderBy('especie')
            ->pluck('especie')
            ->filter()
            ->values();

        return Inertia::render('Documentos/Index', [
            'docs' => $docs,
            'filters' => $filters,
            'speciesOptions' => $species,
        ]);
    }

    public function edit(AnalisisDocumento $doc): InertiaResponse
    {
        $recepcion = $doc->recepcion ?? [];
        $humedad = $doc->humedad ?? [];
        $datos = $doc->datos ?? [];
        $totalCalculado = null;
        if (isset($recepcion['bolsas'], $recepcion['kgbol'])) {
            $b = (float) $recepcion['bolsas'];
            $k = (float) $recepcion['kgbol'];
            if ($b && $k) {
                $totalCalculado = $b * $k;
            }
        }
        $loteSuggestions = AnalisisDocumento::query()
            ->whereNotNull('recepcion')
            ->limit(30)
            ->get()
            ->map(function ($document) {
                return $document->recepcion['lote'] ?? null;
            })
            ->filter()
            ->unique()
            ->values();

        $cultivos = Cultivo::query()
            ->with([
                'variedades:id,cultivo_id,nombre',
                'validez:id,cultivo_id,dias',
            ])
            ->orderBy('especie')
            ->get(['id','especie','categoria_inicial','categoria_final']);

        return Inertia::render('Documentos/Edit', [
            'doc' => [
                'id' => $doc->id,
                'nlab' => $doc->nlab,
                'especie' => $doc->especie,
                'fecha_evaluacion' => optional($doc->fecha_evaluacion)->format('Y-m-d') ?? ($datos['fecha'] ?? null),
                'estado' => $doc->estado ?? ($datos['estado'] ?? null),
                'validez' => $doc->validez ?? ($datos['validez'] ?? null),
                'observaciones' => $doc->observaciones ?? ($datos['observaciones'] ?? null),
                'malezas_nocivas' => $doc->malezas_nocivas ?? ($datos['malezas_nocivas'] ?? null),
                'malezas_comunes' => $doc->malezas_comunes ?? ($datos['malezas_comunes'] ?? null),
                'variedad' => $recepcion['variedad'] ?? null,
                'semillera' => $recepcion['semillera'] ?? null,
                'cooperador' => $recepcion['cooperador'] ?? null,
                'categoria_inicial' => $recepcion['categoria_inicial'] ?? null,
                'categoria_final' => $recepcion['categoria_final'] ?? null,
                'lote' => $recepcion['lote'] ?? null,
                'anio' => $recepcion['anio'] ?? null,
                'bolsas' => $recepcion['bolsas'] ?? null,
                'kgbol' => $recepcion['kgbol'] ?? null,
                'municipio' => $recepcion['municipio'] ?? null,
                'comunidad' => $recepcion['comunidad'] ?? null,
                'aut_import' => $recepcion['aut_import'] ?? null,
                'total' => $recepcion['total'] ?? $totalCalculado,
                'resultado' => $humedad['resultado'] ?? ($datos['resultado'] ?? null),
                'otros_sp_pct' => $humedad['otros_sp_pct'] ?? ($datos['otros_sp_pct'] ?? null),
                'otros_sp_kg' => $humedad['otros_sp_kg'] ?? ($datos['otros_sp_kg'] ?? null),
                'otros_cultivos_pct' => $humedad['otros_cultivos_pct'] ?? ($datos['otros_cultivos_pct'] ?? null),
                'otros_cultivos_kg' => $humedad['otros_cultivos_kg'] ?? ($datos['otros_cultivos_kg'] ?? null),
                'malezas_comunes_pct' => $humedad['malezas_comunes_pct'] ?? ($datos['malezas_comunes_pct'] ?? null),
                'malezas_comunes_kg' => $humedad['malezas_comunes_kg'] ?? ($datos['malezas_comunes_kg'] ?? null),
                'malezas_prohibidas_pct' => $humedad['malezas_prohibidas_pct'] ?? ($datos['malezas_prohibidas_pct'] ?? null),
                'malezas_prohibidas_kg' => $humedad['malezas_prohibidas_kg'] ?? ($datos['malezas_prohibidas_kg'] ?? null),
                'germinacion_pct' => $humedad['germinacion_pct'] ?? ($datos['germinacion_pct'] ?? null),
                'viabilidad_pct' => $humedad['viabilidad_pct']
                    ?? ($humedad['variavilidad_pct'] ?? ($datos['viabilidad_pct'] ?? ($datos['variavilidad_pct'] ?? null))),
            ],
            'loteSuggestions' => $loteSuggestions,
            'cultivos' => $cultivos->map(function ($cultivo) {
                return [
                    'id' => $cultivo->id,
                    'especie' => $cultivo->especie,
                    'categoria_inicial' => $cultivo->categoria_inicial,
                    'categoria_final' => $cultivo->categoria_final,
                    'variedades' => $cultivo->variedades
                        ? $cultivo->variedades->pluck('nombre')->filter()->values()->toArray()
                        : [],
                    'validez_dias' => optional($cultivo->validez)->dias,
                ];
            }),
        ]);
    }

    public function autoprint(AnalisisDocumento $doc): InertiaResponse
    {
        return Inertia::render('Documentos/Autoprint', [
            'doc' => [
                'id' => $doc->id,
                'nlab' => $doc->nlab,
                'especie' => $doc->especie,
            ],
            'inlineUrl' => route('documentos.print', ['doc' => $doc, 'inline' => 1]),
            'downloadUrl' => route('documentos.print', ['doc' => $doc]),
            'backUrl' => route('ui.documentos'),
        ]);
    }

}
