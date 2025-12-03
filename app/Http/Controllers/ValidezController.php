<?php

namespace App\Http\Controllers;

use App\Models\Validez;
use App\Models\Cultivo;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ValidezController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string)$request->query('q', ''));
        $items = Validez::with(['cultivo' => function($q2){ $q2->select('id','especie'); }])
            ->when($q !== '', function ($query) use ($q) {
                return $query->whereHas('cultivo', function($sub) use ($q){
                    $sub->where('especie', 'ilike', '%'.$q.'%');
                });
            })
            ->orderByDesc('id')
            ->get();
        return view('validez', compact('items', 'q'));
    }

    public function create()
    {
        // Mostrar todas las especies (indicando cuáles ya tienen validez)
        $cultivos = Cultivo::with('validez')->orderBy('especie')->get();
        return view('validez_create', compact('cultivos'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cultivo_id' => ['required','exists:cultivos,id', Rule::unique('validez','cultivo_id')],
            'dias' => ['required','integer','min:0','max:65535'],
        ], [
            'cultivo_id.unique' => 'Este cultivo ya tiene validez registrada.',
            'cultivo_id.exists' => 'El cultivo seleccionado no existe.',
        ]);

        Validez::create([
            'cultivo_id' => $data['cultivo_id'],
            'dias' => $data['dias'],
            'unidad' => 'DIAS',
            'cantidad' => $data['dias'],
        ]);
        $to = $request->header('X-Inertia') ? route('ui.cultivos') : route('cultivos.index');
        return redirect($to)->with('status', 'Validez registrada');
    }

    public function edit(Validez $validez)
    {
        // Permitir seleccionar el mismo cultivo o uno sin validez aún
        $cultivos = Cultivo::where(function($q) use ($validez){
                $q->whereDoesntHave('validez')->orWhere('id', $validez->cultivo_id);
            })
            ->orderBy('especie')
            ->get();
        return view('validez_edit', compact('validez', 'cultivos'));
    }

    public function update(Request $request, Validez $validez)
    {
        $data = $request->validate([
            'cultivo_id' => ['required','exists:cultivos,id', Rule::unique('validez','cultivo_id')->ignore($validez->id)],
            'dias' => ['required','integer','min:0','max:65535'],
        ], [
            'cultivo_id.unique' => 'Este cultivo ya tiene validez registrada.',
            'cultivo_id.exists' => 'El cultivo seleccionado no existe.',
        ]);
        $validez->update([
            'cultivo_id' => $data['cultivo_id'],
            'dias' => $data['dias'],
            'unidad' => 'DIAS',
            'cantidad' => $data['dias'],
        ]);
        $to = $request->header('X-Inertia') ? route('ui.cultivos') : route('cultivos.index');
        return redirect($to)->with('status', 'Validez actualizada');
    }

    public function destroy(Validez $validez)
    {
        $validez->delete();
        $to = request()->header('X-Inertia') ? route('ui.cultivos') : route('cultivos.index');
        return redirect($to)->with('status', 'Validez eliminada');
    }
}
