@extends('layouts.app_nav')

@section('title', 'Editar Especie')

@section('content')
    <div class="card form-card form-card--sm">
        <h2 class="card-title">EDITAR ESPECIE</h2>

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

        <form class="grid-form grid-form--sm" method="POST" action="{{ route('cultivos.update', $cultivo) }}">
            @csrf
            @method('PUT')

            <h3 class="section-title">Datos de especie</h3>
            <div class="field">
                <label for="especie">Especie</label>
                <input id="especie" name="especie" type="text" value="{{ old('especie', $cultivo->especie) }}" autocomplete="off" required />
            </div>

            <h3 class="section-title">Categoria</h3>
            <div class="two-col-sm" style="grid-column:1/-1;">
                <div class="field">
                    <label for="categoria_inicial">Inicial</label>
                    <input id="categoria_inicial" name="categoria_inicial" type="text" value="{{ old('categoria_inicial', $cultivo->categoria_inicial) }}" autocomplete="off" />
                </div>
                <div class="field">
                    <label for="categoria_final">Final</label>
                    <input id="categoria_final" name="categoria_final" type="text" value="{{ old('categoria_final', $cultivo->categoria_final) }}" autocomplete="off" />
                </div>
            </div>

            <div class="actions">
                <button class="btn-primary" type="submit">Guardar</button>
                <a class="btn-secondary" href="{{ route('cultivos.index') }}">Cancelar</a>
            </div>
        </form>
    </div>
@endsection
