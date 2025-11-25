<?php

namespace App\Http\Controllers;

use App\Models\Cultivo;
use App\Models\Variedad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
        $target = route('ui.variedades.create', request()->query());
        return redirect()->to($target);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cultivo_id' => [
                'required',
                'exists:cultivos,id',
                Rule::unique('variedades', 'cultivo_id'),
            ],
            'variedad' => ['array'],
            'variedad.*' => ['nullable','string','max:255'],
        ], [
            'cultivo_id.unique' => 'Esta especie ya se encuentra registrada. Usa la opción editar para modificar sus variedades.',
        ]);

        $nombres = collect($data['variedad'] ?? [])
            ->map(fn($v) => trim((string)$v))
            ->filter(fn($v) => $v !== '')
            ->values();

        if ($nombres->isEmpty()) {
            return back()->withErrors(['variedad' => 'Ingresa al menos una variedad.'])->withInput();
        }

        $payload = [
            'cultivo_id' => $data['cultivo_id'],
            'nombre' => $nombres->implode("\n"),
        ];

        $variedad = Variedad::create($payload);

        $redirectTo = $request->input('redirect_to');
        if ($redirectTo) {
            $firstName = $nombres->first();
            if ($firstName) {
                $redirectTo .= (str_contains($redirectTo, '?') ? '&' : '?') . 'variedad=' . urlencode($firstName);
            }
            return redirect()->to($redirectTo)->with('status', $nombres->count().' variedad(es) guardada(s)');
        }
        $to = $request->header('X-Inertia') ? route('ui.variedades') : route('variedades.index');
        return redirect($to)->with('status', $nombres->count().' variedad(es) guardada(s)');
    }

    public function edit(Variedad $variedad)
    {
        $cultivos = Cultivo::orderBy('especie')->get();
        return view('variedades_edit', compact('variedad', 'cultivos'));
    }

    public function update(Request $request, Variedad $variedad)
    {
        $data = $request->validate([
            'variedades' => ['required','array'],
            'variedades.*' => ['nullable','string','max:255'],
        ]);

        $cultivoId = $variedad->cultivo_id;

        $nombres = collect($data['variedades'] ?? [])
            ->map(fn ($nombre) => trim((string) $nombre))
            ->filter(fn ($nombre) => $nombre !== '')
            ->unique(fn ($nombre) => mb_strtolower($nombre))
            ->values();

        if ($nombres->isEmpty()) {
            return back()->withErrors(['variedades' => 'Ingresa al menos una variedad.'])->withInput();
        }

        $variedad->update([
            'nombre' => $nombres->implode("\n"),
        ]);

        $to = $request->header('X-Inertia') ? route('ui.variedades') : route('variedades.index');
        return redirect($to)->with('status', 'Variedades actualizadas');
    }

    public function destroy(Variedad $variedad)
    {
        $variedad->delete();
        $to = request()->header('X-Inertia') ? route('ui.variedades') : route('variedades.index');
        return redirect($to)->with('status', 'Variedad eliminada');
    }

    // Mostrar todas las variedades de un cultivo (especie)
    public function manage(Cultivo $cultivo)
    {
        return redirect()->route('ui.variedades.manage', $cultivo);
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

        $redirect = $request->header('X-Inertia')
            ? route('ui.variedades')
            : route('variedades.index');

        return redirect($redirect)->with('status', 'Variedades actualizadas');
    }
}
