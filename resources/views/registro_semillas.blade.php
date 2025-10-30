@extends('layouts.app_nav')



@section('title', 'REGISTRO_SEMILLAS')

@section('content')
    <div class="card form-card">
        <h2 class="card-title">REGISTRO_SEMILLAS</h2>

        <form class="grid-form grid-form--compact" method="POST" action="{{ route('analisis.finalizar') }}" data-validez-default="{{ $validezDefault ?? '' }}">
            @csrf
            <div style="grid-column:1/-1; display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:16px; align-items:end;">
                <div class="field">
                    <label for="resultado">HUMEDAD (%)</label>
                    <input id="resultado" name="resultado" type="number" placeholder="Llenado obligatorio"step="0.01" required />
                </div>

                <div>
                    <h3 class="section-title">SEMILLA PURA (OTROS)</h3>
                    <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; align-items:end">
                        <div class="field">
                            <label for="otros_sp_pct">Porcentaje %</label>
                            <input id="otros_sp_pct" name="otros_sp_pct" type="number"placeholder="Llenado obligatorio" step="0.01" min="0" max="100" required />
                        </div>
                        <div class="field">
                            <label for="otros_sp_kg">N°/KG</label>
                            <input id="otros_sp_kg" name="otros_sp_kg" type="number"placeholder="Llenado obligatorio" step="1" min="0" required />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="section-title">OTROS CULTIVOS</h3>
                    <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; align-items:end">
                        <div class="field">
                            <label for="otros_cultivos_pct">Porcentaje %</label>
                            <input id="otros_cultivos_pct" name="otros_cultivos_pct" type="number" step="0.01" min="0" max="100" />
                        </div>
                        <div class="field">
                            <label for="otros_cultivos_kg">N°/KG</label>
                            <input id="otros_cultivos_kg" name="otros_cultivos_kg" type="number" step="1" min="0" />
                        </div>
                    </div>
                </div>
            </div>

            <div style="grid-column:1/-1; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:16px;">
                <div>
                    <h3 class="section-title">SEMILLAS DE MALEZAS COMUNES</h3>
                    <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; align-items:end">
                        <div class="field">
                            <label for="malezas_comunes_pct">Porcentaje %</label>
                            <input id="malezas_comunes_pct" name="malezas_comunes_pct" type="number" step="0.01" min="0" max="100" />
                        </div>
                        <div class="field">
                            <label for="malezas_comunes_kg">N°/KG</label>
                            <input id="malezas_comunes_kg" name="malezas_comunes_kg" type="number" step="1" min="0" />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="section-title">SEMILLAS DE MALEZAS PROHIBIDAS</h3>
                    <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; align-items:end">
                        <div class="field">
                            <label for="malezas_prohibidas_pct">Porcentaje %</label>
                            <input id="malezas_prohibidas_pct" name="malezas_prohibidas_pct" type="number" step="0.01" min="0" max="100" />
                        </div>
                        <div class="field">
                            <label for="malezas_prohibidas_kg">N°/KG</label>
                            <input id="malezas_prohibidas_kg" name="malezas_prohibidas_kg" type="number" step="1" min="0" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="two-col-sm" style="grid-column:1/-1; gap:16px;"><div><h3 class="section-title">GERMINACION</h3><div class="field">
                <label for="germinacion_pct">Germinacion %</label>
                <input id="germinacion_pct" name="germinacion_pct" type="number"placeholder="Llenado obligatorio" step="0.01" min="0" max="100" required />
            </div></div><div><h3 class="section-title">VARIAVILIDAD</h3><div class="field"><label for="variavilidad_pct">Variavilidad %</label>
                <input id="variavilidad_pct" name="variavilidad_pct" type="number" step="0.01" min="0" max="100" /></div></div></div>

            <h3 class="section-title" style="grid-column:1/-1">Datos generales</h3>
            <div style="grid-column:1/-1; display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; align-items:end">
            <div class="field field--sm">
                <label for="fecha">Fecha de evaluación</label>
                <input id="fecha" name="fecha" type="date" value="{{ $today ?? now()->format('Y-m-d') }}" required />
            </div>
            <div class="field">
                                  <label>Estado</label>
                <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap">
                    <label style="display:flex; align-items:center; gap:6px">
                        <input type="radio" name="estado" value="APROBADO" /> Aprobado
                    </label>
                    <label style="display:flex; align-items:center; gap:6px">
                        <input type="radio" name="estado" value="RECHAZADO" /> Rechazado
                    </label>
                </div>
            </div>
            <div class="field field--sm">
                <label for="validez">Validez del análisis</label>
                <input id="validez" name="validez" type="text" placeholder="Ej. 6 meses" value="{{ $validezDefault ?? '' }}" />
            </div>
            </div>
            <div style="grid-column:1/-1; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:16px; align-items:start">
                <div class="field" style="min-height:100%">
                    <label for="observaciones">Observaciones</label>
                    <textarea id="observaciones" name="observaciones" rows="6" style="min-height:100%"></textarea>
                </div>
                <div>
                    <h3 class="section-title">Malezas</h3>
                    <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; align-items:end">
                        <div class="field">
                            <label for="malezas_nocivas">Semillas de malezas nocivas o prohibidas</label>
                            <input id="malezas_nocivas" name="malezas_nocivas" type="text" />
                        </div>
                        <div class="field">
                            <label for="malezas_comunes">Semillas de malezas comunes</label>
                            <input id="malezas_comunes" name="malezas_comunes" type="text" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="actions">
                <button class="btn-secondary" type="button" onclick="window.history.back()">Anterior</button>
                <button class="btn-secondary" type="button" onclick="window.print()">Imprimir</button>
                <button class="btn-primary" type="submit">Finalizar</button>
            </div>
        </form>
    </div>
@endsection
@push('scripts')
<script>
(function(){
  const form = document.querySelector('form.grid-form');
  if(!form) return;
  const toUpper = (el) => { if(!el) return; el.value = (el.value || '').toUpperCase(); };
  form.querySelectorAll('input[type="text"], textarea').forEach(inp => {
    inp.addEventListener('input', () => { inp.value = (inp.value || '').toUpperCase(); });
  });
  form.addEventListener('submit', () => {
    form.querySelectorAll('input[type="text"], textarea').forEach(toUpper);
  });
})();
</script>
@endpush
