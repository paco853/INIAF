<?php

namespace App\Http\Controllers;

use App\Models\Semilla;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class SemillasController extends Controller
{
    /**
     * Vista principal: formulario de registro.
     */
    public function index(): View
    {
        return view('semillas');
    }

    /**
     * Registrar una semilla.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'codigo' => ['required', 'string', 'max:100', 'unique:semillas,codigo'],
            'especie' => ['required', 'string', 'max:150'],
            'variedad' => ['nullable', 'string', 'max:150'],
            'lote' => ['nullable', 'string', 'max:100'],
            'procedencia' => ['nullable', 'string', 'max:150'],
            'fecha_recepcion' => ['nullable', 'date'],
            'peso' => ['nullable', 'numeric'],
        ]);

        $data['created_by'] = Auth::id();

        Semilla::create($data);

        return redirect()->route('semillas.index')->with('status', 'Semilla registrada correctamente.');
    }
}
