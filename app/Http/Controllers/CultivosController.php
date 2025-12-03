<?php

namespace App\Http\Controllers;

use App\Models\Cultivo;
use App\Models\Validez;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CultivosController extends Controller
{
    private const VALIDEZ_UNITS = ['DIAS', 'MESES', 'ANIOS'];

    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $cultivos = Cultivo::query()
            ->when($q !== '', function ($query) use ($q) {
                
                return $query->where('especie', 'ilike', '%'.$q.'%');
            })
            ->orderByDesc('id')
            ->get();

        return view('cultivos', compact('cultivos', 'q'));
    }

    public function create()
    {
        return view('cultivos_create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'especie' => ['required','string','max:255', 'unique:cultivos,especie'],
            'categoria_inicial' => ['nullable','string','max:255'],
            'categoria_final' => ['nullable','string','max:255'],
            'dias' => ['required','integer','min:0','max:65535'],
            'validez_amount' => ['required','integer','min:0'],
            'validez_unit' => ['required', Rule::in(self::VALIDEZ_UNITS)],
        ]);

        $data['especie'] = trim($data['especie']);

        $cultivo = Cultivo::create([
            'especie' => $data['especie'],
            'categoria_inicial' => $data['categoria_inicial'] ?? null,
            'categoria_final' => $data['categoria_final'] ?? null,
        ]);
        Validez::updateOrCreate(
            ['cultivo_id' => $cultivo->id],
            [
                'dias' => (int) $data['dias'],
                'unidad' => $data['validez_unit'],
                'cantidad' => (int) $data['validez_amount'],
            ]
        );

        $to = $request->header('X-Inertia') ? route('ui.cultivos') : route('cultivos.index');
        return redirect($to)->with('status', 'Especie guardada: '.$cultivo->especie);
    }

    public function edit(Cultivo $cultivo)
    {
        return view('cultivos_edit', compact('cultivo'));
    }

    public function update(Request $request, Cultivo $cultivo)
    {
        $data = $request->validate([
            'especie' => ['required','string','max:255', Rule::unique('cultivos','especie')->ignore($cultivo->id)],
            'categoria_inicial' => ['nullable','string','max:255'],
            'categoria_final' => ['nullable','string','max:255'],
            'dias' => ['required','integer','min:0','max:65535'],
            'validez_amount' => ['required','integer','min:0'],
            'validez_unit' => ['required', Rule::in(self::VALIDEZ_UNITS)],
        ]);

        $data['especie'] = trim($data['especie']);

        $cultivo->update([
            'especie' => $data['especie'],
            'categoria_inicial' => $data['categoria_inicial'] ?? null,
            'categoria_final' => $data['categoria_final'] ?? null,
        ]);
        Validez::updateOrCreate(
            ['cultivo_id' => $cultivo->id],
            [
                'dias' => (int) $data['dias'],
                'unidad' => $data['validez_unit'],
                'cantidad' => (int) $data['validez_amount'],
            ]
        );
        
        $to = $request->header('X-Inertia') ? route('ui.cultivos') : route('cultivos.index');
        return redirect($to)->with('status', 'Especie actualizada');
    }

    public function destroy(Cultivo $cultivo)
    {
        $cultivo->delete();
        $to = request()->header('X-Inertia') ? route('ui.cultivos') : route('cultivos.index');
        return redirect($to)->with('status', 'Especie eliminada');
    }
}
