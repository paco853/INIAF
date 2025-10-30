@extends('layouts.app_nav')

@section('title', 'Editar Documento')

@section('content')
  <div class="card form-card">
    <h2 class="card-title">Editar Documento</h2>

    <form method="POST" action="{{ route('documentos.update', $doc) }}" class="grid-form grid-form--compact" style="max-width:1200px">
      @csrf
      @method('PUT')

      <div class="field">
        <label for="nlab">NÂº de anÃ¡lisis</label>
        <input id="nlab" name="nlab" type="text" value="{{ old('nlab', $doc->nlab) }}" />
        @error('nlab')<div class="error">{{ $message }}</div>@enderror
      </div>

      <div class="field">
        <label for="especie">Especie</label>
        <input id="especie" name="especie" type="text" value="{{ old('especie', $doc->especie) }}" />
        @error('especie')<div class="error">{{ $message }}</div>@enderror
      </div>

      <div class="field">
        <label for="fecha_evaluacion">Fecha de evaluaciÃ³n</label>
        <input id="fecha_evaluacion" name="fecha_evaluacion" type="date" value="{{ old('fecha_evaluacion', optional($doc->fecha_evaluacion)->format('Y-m-d')) }}" />
        @error('fecha_evaluacion')<div class="error">{{ $message }}</div>@enderror
      </div>

      <div class="field">
        <label for="estado">Estado</label>
        <input id="estado" name="estado" type="text" value="{{ old('estado', $doc->estado) }}" />
        @error('estado')<div class="error">{{ $message }}</div>@enderror
      </div>

      <div class="field">
        <label for="validez">Validez del anÃ¡lisis</label>
        <input id="validez" name="validez" type="text" value="{{ old('validez', $doc->validez) }}" />
        @error('validez')<div class="error">{{ $message }}</div>@enderror
      </div>

      <div class="section-title">Datos de recepción</div>

      @php($r = $doc->recepcion ?? [])
      <div class="grid-form" style="grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; grid-column:1/-1">
        <div class="field"><label for="semillera">Semillera</label><input id="semillera" name="semillera" type="text" value="{{ old('semillera', $r['semillera'] ?? '') }}" /></div>
        <div class="field"><label for="cooperador">Cooperador</label><input id="cooperador" name="cooperador" type="text" value="{{ old('cooperador', $r['cooperador'] ?? '') }}" /></div>
        <div class="field"><label for="variedad">Variedad</label><input id="variedad" name="variedad" type="text" value="{{ old('variedad', $r['variedad'] ?? '') }}" /></div>
        <div class="field"><label for="categoria_inicial">Categoría inicial</label><input id="categoria_inicial" name="categoria_inicial" type="text" value="{{ old('categoria_inicial', $r['categoria_inicial'] ?? '') }}" /></div>
        <div class="field"><label for="categoria_final">Categoría final</label><input id="categoria_final" name="categoria_final" type="text" value="{{ old('categoria_final', $r['categoria_final'] ?? '') }}" /></div>
        <div class="field"><label for="lote">Lote</label><input id="lote" name="lote" type="text" value="{{ old('lote', $r['lote'] ?? '') }}" /></div>
        <div class="field"><label for="bolsas">Nº envases</label><input id="bolsas" name="bolsas" type="number" step="1" min="0" value="{{ old('bolsas', $r['bolsas'] ?? '') }}" /></div>
        <div class="field"><label for="kgbol">KG/Bolsa</label><input id="kgbol" name="kgbol" type="number" step="0.01" min="0" value="{{ old('kgbol', $r['kgbol'] ?? '') }}" /></div>
        <div class="field"><label for="municipio">Municipio</label><input id="municipio" name="municipio" type="text" value="{{ old('municipio', $r['municipio'] ?? '') }}" /></div>
        <div class="field"><label for="comunidad">Comunidad</label><input id="comunidad" name="comunidad" type="text" value="{{ old('comunidad', $r['comunidad'] ?? '') }}" /></div>
        <div class="field"><label for="aut_import">Nº Aut. Import</label><input id="aut_import" name="aut_import" type="text" value="{{ old('aut_import', $r['aut_import'] ?? '') }}" /></div>
      </div>

      <div class="section-title">Métricas de análisis</div>
      <div class="two-col-sm" style="grid-column:1/-1; gap:16px;">
        <div class="field">
          <label for="resultado">Humedad (%)</label>
          <input id="resultado" name="resultado" type="number" step="0.01" value="{{ old('resultado', data_get($doc->humedad,'resultado')) }}" />
        </div>
        <div class="field">
          <label for="germinacion_pct">Germinación %</label>
          <input id="germinacion_pct" name="germinacion_pct" type="number" step="0.01" value="{{ old('germinacion_pct', data_get($doc->humedad,'germinacion_pct')) }}" />
        </div>
      </div>
      <div style="grid-column:1/-1; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px;">
        <div>
          <h3 class="section-title">Semilla pura (otros)</h3>
          <div class="grid-form" style="grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px;">
            <div class="field"><label for="otros_sp_pct">Porcentaje %</label><input id="otros_sp_pct" name="otros_sp_pct" type="number" step="0.01" value="{{ old('otros_sp_pct', data_get($doc->humedad,'otros_sp_pct')) }}" /></div>
            <div class="field"><label for="otros_sp_kg">Nº/KG</label><input id="otros_sp_kg" name="otros_sp_kg" type="number" step="1" value="{{ old('otros_sp_kg', data_get($doc->humedad,'otros_sp_kg')) }}" /></div>
          </div>
        </div>
        <div>
          <h3 class="section-title">Otros cultivos</h3>
          <div class="grid-form" style="grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px;">
            <div class="field"><label for="otros_cultivos_pct">Porcentaje %</label><input id="otros_cultivos_pct" name="otros_cultivos_pct" type="number" step="0.01" value="{{ old('otros_cultivos_pct', data_get($doc->humedad,'otros_cultivos_pct')) }}" /></div>
            <div class="field"><label for="otros_cultivos_kg">Nº/KG</label><input id="otros_cultivos_kg" name="otros_cultivos_kg" type="number" step="1" value="{{ old('otros_cultivos_kg', data_get($doc->humedad,'otros_cultivos_kg')) }}" /></div>
          </div>
        </div>
      </div>
      <div style="grid-column:1/-1; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px;">
        <div>
          <h3 class="section-title">Malezas comunes</h3>
          <div class="grid-form" style="grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px;">
            <div class="field"><label for="malezas_comunes_pct">Porcentaje %</label><input id="malezas_comunes_pct" name="malezas_comunes_pct" type="number" step="0.01" value="{{ old('malezas_comunes_pct', data_get($doc->humedad,'malezas_comunes_pct')) }}" /></div>
            <div class="field"><label for="malezas_comunes_kg">Nº/KG</label><input id="malezas_comunes_kg" name="malezas_comunes_kg" type="number" step="1" value="{{ old('malezas_comunes_kg', data_get($doc->humedad,'malezas_comunes_kg')) }}" /></div>
          </div>
        </div>
        <div>
          <h3 class="section-title">Malezas prohibidas</h3>
          <div class="grid-form" style="grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px;">
            <div class="field"><label for="malezas_prohibidas_pct">Porcentaje %</label><input id="malezas_prohibidas_pct" name="malezas_prohibidas_pct" type="number" step="0.01" value="{{ old('malezas_prohibidas_pct', data_get($doc->humedad,'malezas_prohibidas_pct')) }}" /></div>
            <div class="field"><label for="malezas_prohibidas_kg">Nº/KG</label><input id="malezas_prohibidas_kg" name="malezas_prohibidas_kg" type="number" step="1" value="{{ old('malezas_prohibidas_kg', data_get($doc->humedad,'malezas_prohibidas_kg')) }}" /></div>
          </div>
        </div>
      </div>
      <div class="section-title">Observaciones y Malezas</div>

      <div class="field" style="grid-column:1/-1">
        <label for="observaciones">Observaciones</label>
        <textarea id="observaciones" name="observaciones" rows="3">{{ old('observaciones', $doc->observaciones) }}</textarea>
        @error('observaciones')<div class="error">{{ $message }}</div>@enderror
      </div>

      <div class="field">
        <label for="malezas_nocivas">Malezas nocivas/prohibidas</label>
        <input id="malezas_nocivas" name="malezas_nocivas" type="text" value="{{ old('malezas_nocivas', $doc->malezas_nocivas) }}" />
        @error('malezas_nocivas')<div class="error">{{ $message }}</div>@enderror
      </div>
      <div class="field">
        <label for="malezas_comunes">Malezas comunes</label>
        <input id="malezas_comunes" name="malezas_comunes" type="text" value="{{ old('malezas_comunes', $doc->malezas_comunes) }}" />
        @error('malezas_comunes')<div class="error">{{ $message }}</div>@enderror
      </div>

      <div class="actions">
        <a class="btn-secondary" href="{{ route('documentos.index') }}">Cancelar</a>
        <button class="btn-primary" type="submit">Guardar cambios</button>
      </div>
    </form>
  </div>
@endsection

