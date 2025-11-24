<?php

namespace App\Http\Controllers\Ui;

use App\Http\Controllers\Controller;
use App\Models\Validez;
use App\Models\Cultivo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ValidezUiController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $q = trim((string)$request->query('q', ''));
        $query = Validez::with(['cultivo:id,especie'])
            ->when($q !== '', function ($qr) use ($q) {
                $qr->whereHas('cultivo', function ($sq) use ($q) {
                    $sq->where('especie', 'like', '%'.$q.'%');
                });
            })
            ->orderByDesc('id');

        $items = $query->paginate(20)->withQueryString();
        $items->getCollection()->transform(function ($v) {
            return [
                'id' => $v->id,
                'dias' => $v->dias,
                'cultivo' => [ 'id' => $v->cultivo->id ?? null, 'especie' => $v->cultivo->especie ?? null ],
            ];
        });

        $cultivoCount = Cultivo::count();
        $validezCount = Validez::distinct('cultivo_id')->count('cultivo_id');
        $allCovered = $cultivoCount > 0 && $cultivoCount === $validezCount;

        return Inertia::render('Validez/Index', [
            'items' => $items,
            'q' => $q,
            'allCovered' => $allCovered,
        ]);
    }

    public function create(): InertiaResponse
    {
        $cultivos = Cultivo::with('validez')->orderBy('especie')->get(['id','especie']);
        $options = $cultivos->map(function ($c) {
            return [
                'id' => $c->id,
                'especie' => $c->especie,
                'disabled' => $c->validez !== null,
            ];
        });
        return Inertia::render('Validez/Create', [ 'cultivos' => $options ]);
    }

    public function edit(Validez $validez): InertiaResponse
    {
        $cultivos = Cultivo::where(function($q) use ($validez){
                $q->whereDoesntHave('validez')->orWhere('id', $validez->cultivo_id);
            })
            ->orderBy('especie')
            ->get(['id','especie']);

        return Inertia::render('Validez/Edit', [
            'validez' => [ 'id' => $validez->id, 'cultivo_id' => $validez->cultivo_id, 'dias' => $validez->dias ],
            'cultivos' => $cultivos,
        ]);
    }
}
