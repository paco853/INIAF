@extends('layouts.app_nav')

@section('title', 'Variedades')

@section('content')
    <div class="card form-card form-card--sm form-card--ghost">
        <h2 class="card-title">VARIEDADES</h2>

        @if (session('status'))
            <div class="alert-success" style="border-color:#bbf7d0;color:#065f46;background:#dcfce7;padding:10px 12px;border:1px solid;border-radius:10px;margin-bottom:10px;">
                {{ session('status') }}
            </div>
        @endif

        <div class="actions" style="justify-content:flex-end">
            <a href="{{ route('variedades.create') }}" class="btn-primary" style="text-decoration:none; display:inline-block;">Añadir</a>
        </div>

        <form method="GET" action="{{ route('variedades.index') }}" class="grid-form grid-form--sm" style="margin-top:10px">
            <div class="field" style="grid-column:1/-1; display:grid; grid-template-columns:1fr auto auto; gap:8px; align-items:end;">
                <div>
                    <label for="q">Buscar cultivo</label>
                    <div class="input-with-icon">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" stroke-width="2"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2" stroke-linecap="round"></line>
                        </svg>
                        <input id="q" name="q" type="text" value="{{ $q ?? request('q') }}" placeholder="Buscar por cultivo..." autocomplete="off" />
                    </div>
                </div>
                <div class="actions" style="margin:0">
                    <button class="btn-secondary" type="submit">Buscar</button>
                </div>
                @if(($q ?? request('q')))
                <div class="actions" style="margin:0">
                    <a class="btn-secondary" href="{{ route('variedades.index') }}">Limpiar</a>
                </div>
                @endif
            </div>
        </form>

        <div style="margin-top:12px">
            <table class="table table--rounded">
                <thead>
                    <tr>
                        <th style="width:70%">Especie</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse(($especies ?? []) as $cultivo)
                        <tr>
                            <td>{{ $cultivo->especie }}</td>
                            <td class="actions-cell">
                                <a class="btn btn--sm btn--soft" href="{{ route('variedades.manage', $cultivo) }}" title="Editar">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                    Editar
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td style="color:#6b7280">Aún no hay variedades registradas.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
@endsection
