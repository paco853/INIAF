@extends('layouts.app_nav')

@section('title', 'Descarga general')

@section('content')
  <div class="card form-card">
    <h2 class="card-title">Descargar documentos en un solo PDF</h2>

    <form method="POST" action="{{ route('documentos.bulk_download') }}" class="grid-form grid-form--compact" style="max-width:720px">
      @csrf

      <div class="section-title">Modo de selección</div>

      <div class="field">
        <label for="modo">Modo</label>
        <select id="modo" name="modo">
          <option value="nlab">Por Nº de análisis</option>
          <option value="gestion">Por gestión (año)</option>
        </select>
      </div>

      <div class="field">
        <label for="desde">Desde</label>
        <input id="desde" name="desde" type="number" min="0" required />
        @error('desde')<div class="error">{{ $message }}</div>@enderror
      </div>
      <div class="field">
        <label for="hasta">Hasta</label>
        <input id="hasta" name="hasta" type="number" min="0" required />
        @error('hasta')<div class="error">{{ $message }}</div>@enderror
      </div>

      <div class="actions">
        <a class="btn-secondary" href="{{ route('documentos.index') }}">Cancelar</a>
        <button class="btn-primary" type="submit">Descargar PDF combinado</button>
      </div>
    </form>
  </div>
@endsection

