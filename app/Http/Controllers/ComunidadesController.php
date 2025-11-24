<?php

namespace App\Http\Controllers;

use App\Models\Comunidad;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ComunidadesController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'municipio' => ['required','string','max:150'],
            'comunidad' => [
                'required',
                'string',
                'max:180',
                Rule::unique('comunidades')->where(fn ($q) => $q->where('municipio', $request->municipio)),
            ],
        ]);

        Comunidad::create($data);

        $to = $request->header('X-Inertia') ? back()->getTargetUrl() : route('ui.dashboard');
        return redirect($to)->with('status', 'Comunidad creada');
    }

    public function suggest(): JsonResponse
    {
        $rows = Comunidad::query()
            ->select('id', 'comunidad', 'municipio')
            ->orderBy('comunidad')
            ->get();

        return response()->json(['comunidades' => $rows]);
    }

    public function update(Request $request, Comunidad $comunidad)
    {
        $data = $request->validate([
            'municipio' => ['required','string','max:150'],
            'comunidad' => ['required','string','max:180'],
        ]);

        $comunidad->update($data);

        $to = $request->header('X-Inertia') ? back()->getTargetUrl() : route('ui.dashboard');
        return redirect($to)->with('status', 'Comunidad actualizada');
    }

    public function destroy(Request $request, Comunidad $comunidad)
    {
        $comunidad->delete();
        $to = $request->header('X-Inertia') ? back()->getTargetUrl() : route('ui.dashboard');
        return redirect($to)->with('status', 'Comunidad eliminada');
    }
}
