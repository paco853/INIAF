@extends('layouts.app_nav')

@section('title', 'Editar Variedad')

@section('content')
    <div class="card form-card form-card--sm">
        <h2 class="card-title">EDITAR VARIEDAD</h2>

        @if ($errors->any())
            <div class="alert-success" style="border-color:#fecaca;color:#991b1b;background:#fee2e2;padding:10px 12px;border:1px solid;border-radius:10px;margin-bottom:10px;">
                <strong>Corrige los siguientes campos:</strong>
                <ul style="margin:6px 0 0 16px; padding:0">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form class="grid-form grid-form--sm" method="POST" action="{{ route('variedades.update', $variedad) }}">
            @csrf
            @method('PUT')

            <h3 class="section-title">Datos de cultivo</h3>
            <div class="field">
                <label for="cultivo_id">Cultivo</label>
                <select id="cultivo_id" name="cultivo_id" required>
                    @foreach (($cultivos ?? []) as $cultivo)
                        <option value="{{ $cultivo->id }}" {{ old('cultivo_id', $variedad->cultivo_id) == $cultivo->id ? 'selected' : '' }}>{{ $cultivo->especie }}</option>
                    @endforeach
                </select>
            </div>

            <h3 class="section-title">Variedad</h3>
            <div class="field">
                <label for="nombre">Nombre de la variedad</label>
                <input id="nombre" name="nombre" type="text" value="{{ old('nombre', $variedad->nombre) }}" autocomplete="off" required />
            </div>

            <div class="actions">
                <button class="btn-primary" type="submit">Guardar</button>
                <a class="btn-secondary" href="{{ route('variedades.index') }}">Cancelar</a>
            </div>
        </form>
    </div>
@endsection
