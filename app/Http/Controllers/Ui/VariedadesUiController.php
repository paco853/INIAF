<?php

namespace App\Http\Controllers\Ui;

use App\Http\Controllers\Controller;
use App\Models\Variedad;
use App\Models\Cultivo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class VariedadesUiController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $q = trim((string)$request->query('q', ''));
        $query = Variedad::with(['cultivo:id,especie'])
            ->when($q !== '', function ($qr) use ($q) {
                $qr->where(function ($sub) use ($q) {
                    $sub->where('nombre', 'like', '%'.$q.'%')
                        ->orWhereHas('cultivo', function ($sq) use ($q) {
                            $sq->where('especie', 'like', '%'.$q.'%');
                        });
                });
            })
            ->orderByDesc('id');

        $items = $query->paginate(20)->withQueryString();
        $items->getCollection()->transform(function ($v) {
            $names = collect(preg_split('/\r\n|\n|\r/', (string) $v->nombre))
                ->map(fn ($name) => trim($name))
                ->filter(fn ($name) => $name !== '')
                ->values();
            return [
                'id' => $v->id,
                'nombre' => $names,
                'cultivo' => [ 'id' => $v->cultivo->id ?? null, 'especie' => $v->cultivo->especie ?? null ],
            ];
        });

        $cultivoCount = Cultivo::count();
        $coveredCultivos = Variedad::distinct('cultivo_id')->count('cultivo_id');
        $allCovered = $cultivoCount > 0 && $cultivoCount === $coveredCultivos;

        return Inertia::render('Variedades/Index', [
            'variedades' => $items,
            'q' => $q,
            'allCovered' => $allCovered,
        ]);
    }

    public function create(Request $request): InertiaResponse
    {
        $cultivos = Cultivo::orderBy('especie')->get(['id','especie']);
        $defaultCultivoId = $request->query('cultivo_id');
        $usados = Variedad::pluck('cultivo_id')->all();
        return Inertia::render('Variedades/Create', [
            'cultivos' => $cultivos,
            'defaultCultivoId' => $defaultCultivoId,
            'usedCultivoIds' => $usados,
            'redirectTo' => $request->query('redirect_to'),
        ]);
    }

    public function edit(Variedad $variedad): InertiaResponse
    {
        $cultivo = $variedad->cultivo()->select('id', 'especie')->first();
        $rawNames = preg_split('/\r\n|\n|\r/', (string) $variedad->nombre);
        $variedades = collect($rawNames)
            ->map(fn ($nombre) => trim($nombre))
            ->filter(fn ($nombre) => $nombre !== '')
            ->values();

        return Inertia::render('Variedades/Edit', [
            'variedadId' => $variedad->id,
            'cultivo' => [
                'id' => $cultivo->id ?? $variedad->cultivo_id,
                'especie' => $cultivo->especie ?? '',
            ],
            'variedades' => $variedades,
        ]);
    }

    public function manage(Cultivo $cultivo): InertiaResponse
    {
        $cultivo->load(['variedades' => function ($query) {
            $query->orderBy('nombre');
        }]);

        $variedades = $cultivo->variedades
            ->flatMap(function ($variedad) {
                return collect(preg_split('/\r\n|\n|\r/', (string) $variedad->nombre))
                    ->map(fn ($nombre) => trim($nombre))
                    ->filter(fn ($nombre) => $nombre !== '');
            })
            ->values();

        return Inertia::render('Variedades/Manage', [
            'cultivo' => [
                'id' => $cultivo->id,
                'especie' => $cultivo->especie,
            ],
            'variedades' => $variedades,
        ]);
    }
}
