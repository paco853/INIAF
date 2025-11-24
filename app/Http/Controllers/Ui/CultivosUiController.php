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
        $query = Cultivo::query()
            ->when($q !== '', function ($qr) use ($q) {
                return $qr->where('especie', 'like', '%'.$q.'%');
            })
            ->orderByDesc('id');

        $cultivos = $query->paginate(20)->withQueryString();
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
        return Inertia::render('Cultivos/Edit', [
            'cultivo' => [
                'id' => $cultivo->id,
                'especie' => $cultivo->especie,
                'categoria_inicial' => $cultivo->categoria_inicial,
                'categoria_final' => $cultivo->categoria_final,
            ],
        ]);
    }
}
