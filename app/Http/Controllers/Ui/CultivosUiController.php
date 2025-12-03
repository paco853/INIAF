<?php

namespace App\Http\Controllers\Ui;

use App\Http\Controllers\Controller;
use App\Models\Cultivo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CultivosUiController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $q = trim((string) $request->query('q', ''));
        $query = Cultivo::with('validez:id,cultivo_id,dias,unidad,cantidad')
            ->select(['id','especie','categoria_inicial','categoria_final'])
            ->when($q !== '', function ($qr) use ($q) {
                return $qr->where('especie', 'like', '%'.$q.'%');
            })
            ->orderByDesc('id');

        $cultivos = $query->paginate(20)->withQueryString();
        $cultivos->getCollection()->transform(function ($c) {
            return [
                'id' => $c->id,
                'especie' => $c->especie,
                'categoria_inicial' => $c->categoria_inicial,
                'categoria_final' => $c->categoria_final,
                'validez' => $c->validez ? [
                    'dias' => $c->validez->dias,
                    'cantidad' => $c->validez->cantidad,
                    'unidad' => $c->validez->unidad,
                ] : null,
            ];
        });

        $speciesOptions = Cultivo::query()
            ->select('especie')
            ->whereNotNull('especie')
            ->groupBy('especie')
            ->orderBy('especie')
            ->pluck('especie')
            ->filter()
            ->values();

        return Inertia::render('Cultivos/Index', [
            'cultivos' => $cultivos,
            'q' => $q,
            'speciesOptions' => $speciesOptions,
        ]);
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('Cultivos/Create');
    }

    public function edit(Cultivo $cultivo): InertiaResponse
    {
        $cultivo->load('validez:id,cultivo_id,dias,unidad,cantidad');
        $validez = $cultivo->validez;
        return Inertia::render('Cultivos/Edit', [
            'cultivo' => [
                'id' => $cultivo->id,
                'especie' => $cultivo->especie,
                'categoria_inicial' => $cultivo->categoria_inicial,
                'categoria_final' => $cultivo->categoria_final,
                'validez' => $validez ? [
                    'dias' => $validez->dias,
                    'cantidad' => $validez->cantidad,
                    'unidad' => $validez->unidad,
                ] : null,
            ],
        ]);
    }
}
