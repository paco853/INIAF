@extends('layouts.app_nav')

@section('title', 'Validez de Analisis')

@section('content')
    <div class="card form-card form-card--sm form-card--ghost">
        <h2 class="card-title">VALIDEZ DE ANALISIS</h2>

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

        <form class="grid-form grid-form--sm" method="POST" action="{{ route('validez.store') }}">
            @csrf

                        <div class="field">
                <label for="cultivo_id">Especie</label>
                <select id="cultivo_id" name="cultivo_id" required>
                    @foreach (($cultivos ?? []) as $cultivo)
                        @php $hasVal = isset($cultivo->validez) && !is_null($cultivo->validez); @endphp
                        <option value="{{ $cultivo->id }}" {{ old('cultivo_id') == $cultivo->id ? 'selected' : '' }} {{ $hasVal ? 'disabled' : '' }}>
                            {{ $cultivo->especie }}{{ $hasVal ? ' (ya se encuentra registrada)' : '' }}
                        </option>
                    @endforeach
                </select>



            <div class="field">
                <label for="dias">Días de validez</label>
                <input id="dias" name="dias" type="number" min="0" step="1" value="{{ old('dias') }}" placeholder="Ej. 30" required />
            </div>

            <div class="actions">
                <button class="btn-primary" type="submit">Guardar</button>
                <a class="btn-secondary" href="{{ route('validez.index') }}">Cancelar</a>
            </div>
        </form>
    </div>
@endsection
