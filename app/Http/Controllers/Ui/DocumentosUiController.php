<?php

namespace App\Http\Controllers\Ui;

use App\Http\Controllers\Controller;
use App\Models\AnalisisDocumento;
use App\Models\DocumentoApariencia;
use App\Models\Cultivo;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;

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
            'cooperador' => trim((string) $request->query('cooperador', '')),
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

        if ($filters['cooperador'] !== '') {
            $query->where('recepcion->cooperador', 'like', '%'.$filters['cooperador'].'%');
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
        $docsAll = AnalisisDocumento::query()
            ->select(['id','nlab','especie','estado'])
            ->orderByDesc('id')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'nlab' => $doc->nlab,
                    'especie' => $doc->especie,
                    'estado' => $doc->estado,
                ];
            })
            ->toArray();

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
            'docsAll' => $docsAll,
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
                'validez:id,cultivo_id,dias,unidad,cantidad',
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
                'validez' => $doc->validez ?? ($humedad['validez'] ?? ($datos['validez'] ?? null)),
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
                    'validez' => $cultivo->validez ? [
                        'dias' => $cultivo->validez->dias,
                        'cantidad' => $cultivo->validez->cantidad,
                        'unidad' => $cultivo->validez->unidad,
                    ] : null,
                ];
            }),
            ]);
    }

    public function apariencia(): InertiaResponse
    {
        $availableLaboratorios = AnalisisDocumento::query()
            ->whereNotNull('nlab')
            ->orderBy('nlab')
            ->pluck('nlab')
            ->map(fn ($value) => strtoupper(trim((string) $value)))
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $appearances = DocumentoApariencia::with('laboratorios')
            ->orderByDesc('created_at')
            ->get();
        $hasActiveFlag = $this->hasIsActiveColumn();
        $currentAppearance = null;
        if ($hasActiveFlag) {
            $currentAppearance = DocumentoApariencia::query()
                ->with('laboratorios')
                ->where('is_active', true)
                ->latest('updated_at')
                ->first();
        }
        $currentAppearance = $currentAppearance ?? $appearances->first();
        $savedAppearances = $appearances->map(function (DocumentoApariencia $entry) {
            $logoLeft = $entry->logo_left_path
                ? Storage::disk('public')->url($entry->logo_left_path)
                : null;
            $logoRight = $entry->logo_right_path
                ? Storage::disk('public')->url($entry->logo_right_path)
                : null;

            return [
                'id' => $entry->id,
                'blankTemplateUrl' => route('documentos.apariencia.blank', $entry),
                'logoLeftUrl' => $logoLeft,
                'logoRightUrl' => $logoRight,
                'createdAt' => $entry->created_at?->toIso8601String() ?? null,
                'isActive' => (bool) ($entry->is_active ?? false),
                'laboratorios' => $entry->laboratorios
                    ->pluck('numero_laboratorio')
                    ->map(fn ($value) => trim((string) $value))
                    ->filter()
                    ->values()
                    ->toArray(),
                'fechaInicio' => $entry->fecha_inicio?->format('Y-m-d'),
                'fechaFin' => $entry->fecha_fin?->format('Y-m-d'),
            ];
        })->toArray();

        $logoLeftUrl = $currentAppearance && $currentAppearance->logo_left_path
            ? Storage::disk('public')->url($currentAppearance->logo_left_path)
            : null;
        $logoRightUrl = $currentAppearance && $currentAppearance->logo_right_path
            ? Storage::disk('public')->url($currentAppearance->logo_right_path)
            : null;

        return Inertia::render('Documentos/AparienciaDocumento', [
            'appearance' => [
                'id' => $currentAppearance?->id ?? null,
                'footerText' => $currentAppearance?->footer_text ?? '',
                'logoLeftUrl' => $logoLeftUrl,
                'logoRightUrl' => $logoRightUrl,
                'logoLeftPath' => $currentAppearance?->logo_left_path ?? null,
                'logoRightPath' => $currentAppearance?->logo_right_path ?? null,
                'isActive' => (bool) ($currentAppearance?->is_active ?? false),
                'laboratorios' => $currentAppearance
                    ? $currentAppearance->laboratorios
                        ->pluck('numero_laboratorio')
                        ->map(fn ($value) => trim((string) $value))
                        ->filter()
                        ->values()
                        ->toArray()
                    : [],
                'fechaInicio' => $currentAppearance?->fecha_inicio?->format('Y-m-d'),
                'fechaFin' => $currentAppearance?->fecha_fin?->format('Y-m-d'),
            ],
            'savedAppearances' => $savedAppearances,
            'availableLaboratorios' => $availableLaboratorios,
        ]);
    }

    public function updateApariencia(Request $request): RedirectResponse
    {
        $request->validate([
            'logo_left' => ['nullable', 'image', 'max:4096'],
            'logo_right' => ['nullable', 'image', 'max:4096'],
        ], [
            'logo_left.image' => 'El logo izquierdo debe ser una imagen (PNG/JPG/SVG).',
            'logo_right.image' => 'El logo derecho debe ser una imagen (PNG/JPG/SVG).',
        ]);

        $latestAppearance = DocumentoApariencia::latest('id')->first();
        $logoLeftPath = $latestAppearance?->logo_left_path ?? null;
        $logoRightPath = $latestAppearance?->logo_right_path ?? null;

        if ($request->hasFile('logo_left')) {
            $logoLeftPath = $this->storeLogoFile(
                $request->file('logo_left'),
                'logo-izquierdo',
                $logoLeftPath,
                false,
            );
        }

        if ($request->hasFile('logo_right')) {
            $logoRightPath = $this->storeLogoFile(
                $request->file('logo_right'),
                'logo-derecho',
                $logoRightPath,
                false,
            );
        }

        if ($this->hasIsActiveColumn()) {
            DocumentoApariencia::query()->update(['is_active' => false]);
        }

        $newAppearance = [
            'logo_left_path' => $logoLeftPath,
            'logo_right_path' => $logoRightPath,
            'footer_text' => $latestAppearance?->footer_text ?? null,
        ];
        if ($this->hasIsActiveColumn()) {
            $newAppearance['is_active'] = true;
        }

        DocumentoApariencia::create($newAppearance);

        return redirect()
            ->route('ui.documentos.apariencia')
            ->with('status', 'Apariencia guardada correctamente.');
    }

    public function updateAparienciaLaboratorios(Request $request, DocumentoApariencia $appearance): RedirectResponse
    {
        $validated = $request->validate([
            'laboratorios' => ['nullable', 'array'],
            'laboratorios.*' => ['string', 'max:100'],
        ]);

        $numbers = collect($validated['laboratorios'] ?? [])
            ->map(fn ($value) => strtoupper(trim((string) $value)))
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $appearance->laboratorios()->delete();
        if (!empty($numbers)) {
            $payload = array_map(fn ($numero) => ['numero_laboratorio' => $numero], $numbers);
            $appearance->laboratorios()->createMany($payload);
        }

        return redirect()
            ->route('ui.documentos.apariencia')
            ->with('status', 'Laboratorios actualizados correctamente.');
    }

    public function updateAparienciaFechas(Request $request, DocumentoApariencia $appearance): RedirectResponse
    {
        $validated = $request->validate([
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'required_with:fecha_inicio', 'after_or_equal:fecha_inicio'],
        ]);

        $appearance->update([
            'fecha_inicio' => $validated['fecha_inicio'] ?? null,
            'fecha_fin' => $validated['fecha_fin'] ?? null,
        ]);

        return redirect()
            ->route('ui.documentos.apariencia')
            ->with('status', 'Rango de fechas actualizado correctamente.');
    }

    public function updateAparienciaVersion(Request $request, DocumentoApariencia $appearance): RedirectResponse
    {
        $request->validate([
            'logo_left' => ['nullable', 'image', 'max:4096'],
            'logo_right' => ['nullable', 'image', 'max:4096'],
        ], [
            'logo_left.image' => 'El logo izquierdo debe ser una imagen (PNG/JPG/SVG).',
            'logo_right.image' => 'El logo derecho debe ser una imagen (PNG/JPG/SVG).',
        ]);

        $logoLeftPath = $appearance->logo_left_path;
        $logoRightPath = $appearance->logo_right_path;

        if ($request->hasFile('logo_left')) {
            $logoLeftPath = $this->storeLogoFile(
                $request->file('logo_left'),
                'logo-izquierdo',
                $appearance->logo_left_path,
                true,
                $appearance->id,
            );
        }

        if ($request->hasFile('logo_right')) {
            $logoRightPath = $this->storeLogoFile(
                $request->file('logo_right'),
                'logo-derecho',
                $appearance->logo_right_path,
                true,
                $appearance->id,
            );
        }

        $appearance->update([
            'logo_left_path' => $logoLeftPath,
            'logo_right_path' => $logoRightPath,
        ]);

        return redirect()
            ->route('ui.documentos.apariencia')
            ->with('status', 'Apariencia guardada correctamente.');
    }

    public function destroyAparienciaVersion(DocumentoApariencia $appearance): RedirectResponse
    {
        $wasActive = $appearance->is_active;
        $this->deleteLogoFileIfUnused($appearance->logo_left_path, $appearance->id);
        $this->deleteLogoFileIfUnused($appearance->logo_right_path, $appearance->id);
        $appearance->delete();

        if ($wasActive && $this->hasIsActiveColumn()) {
            $nextActive = DocumentoApariencia::query()
                ->latest('created_at')
                ->first();
            if ($nextActive) {
                DocumentoApariencia::query()->update(['is_active' => false]);
                $nextActive->update(['is_active' => true]);
            }
        }

        return redirect()
            ->route('ui.documentos.apariencia')
            ->with('status', 'Apariencia eliminada correctamente.');
    }

    private function storeLogoFile(?UploadedFile $file, string $prefix, ?string $previous = null, bool $deletePrevious = true, ?int $excludeId = null): ?string
    {
        if ($file === null) {
            return $previous;
        }

        $path = $file->storeAs('documentos/logos', $prefix.'-'.now()->format('YmdHis').'.'.$file->extension(), 'public');
        if ($deletePrevious && $previous) {
            $this->deleteLogoFileIfUnused($previous, $excludeId);
        }
        return $path;
    }

    private function deleteLogoFileIfUnused(?string $path, ?int $excludeId = null): void
    {
        if (!$path) {
            return;
        }

        $query = DocumentoApariencia::query()
            ->where(function ($query) use ($path) {
                $query->where('logo_left_path', $path)
                    ->orWhere('logo_right_path', $path);
            });

        if ($excludeId !== null) {
            $query->where('id', '<>', $excludeId);
        }

        if ($query->exists()) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function hasIsActiveColumn(): bool
    {
        static $exists;
        if ($exists === null) {
            $exists = Schema::hasColumn('documento_apariencias', 'is_active');
        }
        return $exists;
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
