<?php

namespace App\Http\Controllers;

use App\Models\Cultivo;
use Illuminate\Http\Request;

class CultivosController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $cultivos = Cultivo::query()
            ->when($q !== '', function ($query) use ($q) {
                // Postgres soporta ILIKE para busqueda insensible a mayusculas
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
        ]);

        $data['especie'] = trim($data['especie']);

        $cultivo = Cultivo::create($data);

        return redirect()->route('cultivos.index')->with('status', 'Especie guardada: '.$cultivo->especie);
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
        ]);

        $data['especie'] = trim($data['especie']);

        $cultivo->update($data);
        return redirect()->route('cultivos.index')->with('status', 'Especie actualizada');
    }

    public function destroy(Cultivo $cultivo)
    {
        $cultivo->delete();
        return redirect()->route('cultivos.index')->with('status', 'Especie eliminada');
    }
}
use Illuminate\Validation\Rule;
