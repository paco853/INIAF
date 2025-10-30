<?php

namespace App\Http\Controllers;

use App\Models\Cultivo;
use App\Models\Variedad;
use Illuminate\Http\Request;

class VariedadesController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string)$request->query('q', ''));
        // Mostrar solo el cultivo (especie) que tiene variedades registradas, con filtro opcional
        $especies = Cultivo::whereHas('variedades')
            ->when($q !== '', function ($query) use ($q) {
                return $query->where('especie', 'ilike', '%'.$q.'%');
            })
            ->orderBy('especie')
            ->get();
        return view('variedades', compact('especies', 'q'));
    }

    public function create()
    {
        $cultivos = Cultivo::orderBy('especie')->get();
        $selectedCultivoId = request()->query('cultivo_id');
        return view('variedades_create', compact('cultivos', 'selectedCultivoId'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cultivo_id' => ['required','exists:cultivos,id'],
            'variedad' => ['array'],
            'variedad.*' => ['nullable','string','max:255'],
        ]);

        // Evitar guardar si el cultivo ya fue usado anteriormente
        if (Variedad::where('cultivo_id', $data['cultivo_id'])->exists()) {
            return back()
                ->withErrors(['cultivo_id' => 'Este cultivo ya tiene variedades registradas.'])
                ->withInput();
        }

        $nombres = collect($data['variedad'] ?? [])
            ->map(fn($v) => trim((string)$v))
            ->filter(fn($v) => $v !== '')
            ->values();

        if ($nombres->isEmpty()) {
            return back()
                ->withErrors(['variedad' => 'Ingresa al menos una variedad.'])
                ->withInput();
        }

        $count = 0;
        foreach ($nombres as $nombre) {
            Variedad::create([
                'cultivo_id' => $data['cultivo_id'],
                'nombre' => $nombre,
            ]);
            $count++;
        }

        $redirectTo = $request->input('redirect_to');
        if ($redirectTo) {
            $firstName = $nombres->first();
            if ($firstName) {
                $redirectTo .= (str_contains($redirectTo, '?') ? '&' : '?') . 'variedad=' . urlencode($firstName);
            }
            return redirect()->to($redirectTo)->with('status', $count.' variedad(es) guardada(s)');
        }
        // Redirección por defecto: volver a Variedades
        return redirect()->route('variedades.index')->with('status', $count.' variedad(es) guardada(s)');
    }

    public function edit(Variedad $variedad)
    {
        $cultivos = Cultivo::orderBy('especie')->get();
        return view('variedades_edit', compact('variedad', 'cultivos'));
    }

    public function update(Request $request, Variedad $variedad)
    {
        $data = $request->validate([
            'cultivo_id' => ['required','exists:cultivos,id'],
            'nombre' => ['required','string','max:255'],
        ]);
        $variedad->update($data);
        return redirect()->route('variedades.index')->with('status', 'Variedad actualizada');
    }

    public function destroy(Variedad $variedad)
    {
        $variedad->delete();
        return redirect()->route('variedades.index')->with('status', 'Variedad eliminada');
    }

    // Mostrar todas las variedades de un cultivo (especie)
    public function manage(Cultivo $cultivo)
    {
        $cultivo->load('variedades');
        return view('variedades_manage', compact('cultivo'));
    }

    // Actualizar en bloque las variedades de un cultivo
    public function bulkUpdate(Request $request, Cultivo $cultivo)
    {
        $data = $request->validate([
            'variedad' => ['array'],
            'variedad.*' => ['nullable','string','max:255'],
        ]);

        $nombres = collect($data['variedad'] ?? [])
            ->map(fn($v) => trim((string)$v))
            ->filter(fn($v) => $v !== '')
            ->unique(function ($v) { return mb_strtolower($v); })
            ->values();

        if ($nombres->isEmpty()) {
            return back()->withErrors(['variedad' => 'Ingresa al menos una variedad.'])->withInput();
        }

        \DB::transaction(function () use ($cultivo, $nombres) {
            \App\Models\Variedad::where('cultivo_id', $cultivo->id)->delete();
            foreach ($nombres as $nombre) {
                \App\Models\Variedad::create([
                    'cultivo_id' => $cultivo->id,
                    'nombre' => $nombre,
                ]);
            }
        });

        return redirect()->route('variedades.index')->with('status', 'Variedades actualizadas');
    }
}
