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
        $query = Cultivo::with('validez:id,cultivo_id,dias')
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
                'dias' => $c->validez->dias ?? null,
            ];
        });

        return Inertia::render('Cultivos/Index', [
            'cultivos' => $cultivos,
            'q' => $q,
        ]);
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('Cultivos/Create');
    }

    public function edit(Cultivo $cultivo): InertiaResponse
    {
        $cultivo->load('validez:id,cultivo_id,dias');
        return Inertia::render('Cultivos/Edit', [
            'cultivo' => [
                'id' => $cultivo->id,
                'especie' => $cultivo->especie,
                'categoria_inicial' => $cultivo->categoria_inicial,
                'categoria_final' => $cultivo->categoria_final,
                'dias' => $cultivo->validez->dias ?? null,
            ],
        ]);
    }
}
