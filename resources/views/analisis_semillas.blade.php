@extends('layouts.app_nav')

@section('title', 'REGISTRO DE RECEPCION')

@section('content')
    <div class="card form-card form-card--sm">
        <h2 class="card-title">REGISTRO DE RECEPCION</h2>

        <form id="formRecepcion" class="grid-form grid-form--4-col" method="POST" action="{{ route('analisis.recepcion.submit') }}" data-compute-url="{{ route('analisis.semillas.compute') }}" data-suggest-url="{{ route('analisis.especies.suggest') }}" data-var-suggest-url="{{ route('analisis.variedades.suggest') }}" data-var-create-url="{{ route('variedades.create') }}" data-reg-url="{{ route('analisis.semillas') }}" data-csrf="{{ csrf_token() }}">
            @csrf
            @if ($errors->any())
                <div class="alert-success" style="border-color:#fecaca;color:#991b1b;background:#fee2e2">
                    <strong>Corrige los siguientes campos:</strong>
                    <ul style="margin:6px 0 0 16px; padding:0">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
            <h3 class="section-title">Datos generales</h3>
            <div class="field field--sm">
                <label for="nlab">N° Lab</label>
                <input id="nlab" name="nlab" type="text" value="{{ old('nlab') }}" autocomplete="off" placeholder="Ingrese N° de laboratorio" maxlength="50" required />
                
            </div>

            <div class="field field--sm">
                <label for="especie">Especie</label>
                <select id="especie" name="especie" required>
                    @foreach(($cultivos ?? []) as $c)
                        <option value="{{ $c->especie }}" data-cultivo-id="{{ $c->id }}" data-inicial="{{ $c->categoria_inicial }}" data-final="{{ $c->categoria_final }}" {{ old('especie', request('especie')) === $c->especie ? 'selected' : '' }}>{{ $c->especie }}</option>
                    @endforeach
                </select>
            </div>

            <div class="field field--sm">
                <label for="variedad">Variedad</label>
                @if(($cultivos ?? collect())->count())
                    <select id="variedad" name="variedad" data-old-value="{{ old('variedad', request('variedad')) }}">
                    </select>
                    <div id="variedadHint" class="hint" style="display:none; margin-top:6px; padding:8px 10px; border:1px dashed #cbd5e1; border-radius:8px; background:#f8fafc; color:#334155;">
                        No hay variedades registradas para esta especie. 
                        <a id="variedadAddLink" href="{{ route('variedades.create') }}" style="text-decoration:underline;">Añadir variedad</a>
                    </div>
                @else
                    <select id="variedad" name="variedad" disabled>
                        <option value="">No hay especies registradas</option>
                    </select>
                @endif
            </div>

            <div class="field">
                <label for="semillera">Semillera</label>
                <input id="semillera" name="semillera" type="text" value="{{ old('semillera') }}"placeholder="Llenado obligatorio" autocomplete="off" maxlength="150" required />
            </div>

            <div class="field">
                <label for="cooperador">Cooperador</label>
                <input id="cooperador" name="cooperador" type="text" placeholder="Nombre del cooperador" value="{{ old('cooperador') }}" autocomplete="off" maxlength="150" required />
            </div>

            <h3 class="section-title">Categoria</h3>
                <div class="field">
                    <label for="categoria_inicial">Categoria Inicial</label>
                    <input id="categoria_inicial" name="categoria_inicial" type="text" value="{{ old('categoria_inicial') }}" maxlength="100" />
                </div>

                <div class="field">
                    <label for="categoria_final">Categoria Final</label>
                    <input id="categoria_final" name="categoria_final" type="text" value="{{ old('categoria_final') }}" maxlength="100" />
                </div>

            <div class="three-col" style="grid-column:1/-1; display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:12px; align-items:end;">
                <div class="field field--md">
                    <label for="lote">Lote</label>
                <input id="lote" name="lote" type="text" value="{{ old('lote') }}" maxlength="100" required />
                    
                </div>
                <div class="field">
                    <label for="bolsas">N° ENVASES</label>
                    <input id="bolsas" name="bolsas" type="number" min="0" step="1" value="{{ old('bolsas', 0) }}" />
                </div>
                <div class="field">
                    <label for="kgbol">KG</label>
                    <input id="kgbol" name="kgbol" type="number" min="0" step="0.01" value="{{ old('kgbol', 0) }}" />
                </div>
            </div>

            <h3 class="section-title">Origen</h3>
                <div class="field">
                    <label for="municipio">Municipio</label>
                    <input id="municipio" name="municipio" type="text" value="{{ old('municipio') }}" placeholder="Llenado obligatorio" maxlength="150" required />
                </div>
                <div class="field">
                    <label for="comunidad">Comunidad</label>
                    <input id="comunidad" name="comunidad" type="text" value="{{ old('comunidad') }}"placeholder="Llenado obligatorio" maxlength="150" required />
                </div>
            <div class="field field--sm">
                <label for="aut_import">N° AUT. IMPORT</label>
                <input id="aut_import" name="aut_import" type="text" value="{{ old('aut_import', 'NINGUNO') }}" maxlength="150" />
            </div>

            <div class="actions">
              
                <button class="btn-primary" type="submit">Siguiente</button>
                <button class="btn-secondary" type="button" onclick="window.history.back()">Cancelar</button>
            </div>
        </form>
    </div>
    
@endsection

@push('scripts')
<script>
(function() {
    const form = document.getElementById('formRecepcion');
    if (!form) return;

    const especieSelect = form.querySelector('#especie');
    const variedadSelect = form.querySelector('#variedad');
    const latinInput = form.querySelector('#latin');
    const catInicialInput = form.querySelector('#categoria_inicial');
    const catFinalInput = form.querySelector('#categoria_final');
    const varSuggestUrl = form.dataset.varSuggestUrl;

    async function updateVariedades() {
        const selectedOption = especieSelect.options[especieSelect.selectedIndex];
        const cultivoId = selectedOption.dataset.cultivoId;
        const especie = selectedOption.value;

        // Actualizar campos de categor�a y lata�n
        if (latinInput) latinInput.value = selectedOption.dataset.latin || '';
        if (catInicialInput) catInicialInput.value = selectedOption.dataset.inicial || '';
        if (catFinalInput) catFinalInput.value = selectedOption.dataset.final || '';

        // Limpiar el select de variedades y ocultar el hint
        variedadSelect.innerHTML = '';
        const variedadHint = document.getElementById('variedadHint');
        if (variedadHint) variedadHint.style.display = 'none';

        if (!cultivoId || !varSuggestUrl) {
            return;
        }

        try {
            const url = new URL(varSuggestUrl);
            url.searchParams.set('cultivo_id', cultivoId);
            const response = await fetch(url);
            const data = await response.json();
            const items = data.items || [];

            if (items.length === 0) {
                if (variedadHint) {
                    variedadHint.style.display = 'block';
                }
                return;
            }

            const oldVariedad = variedadSelect.dataset.oldValue || '';
            items.forEach(v => {
                const option = new Option(v.nombre, v.nombre);
                if (v.nombre === oldVariedad) option.selected = true;
                variedadSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar variedades:', error);
        }
    }

    if (especieSelect && variedadSelect) {
        especieSelect.addEventListener('change', updateVariedades);
        // Si hay un valor previo, cargar las variedades al inicio
        if (especieSelect.value) {
            updateVariedades();
        }
    }

    // May�sculas en todos los inputs de texto
    const toUpper = (el) => { if (!el) return; el.value = (el.value || '').toUpperCase(); };
    form.querySelectorAll('input[type="text"]').forEach(inp => {
        inp.addEventListener('input', () => { inp.value = (inp.value || '').toUpperCase(); });
    });

    // Generaci�n autom�tica de lote editable
    const cooperadorInput = form.querySelector('#cooperador');
    const nlabInput = form.querySelector('#nlab');
    const loteInput = form.querySelector('#lote');
    let loteDirty = false;
    if (loteInput) {
        loteInput.addEventListener('input', () => { loteDirty = true; });
    }
    function genLote() {
        if (!loteInput || loteDirty) return;
        const coop = (cooperadorInput?.value || '').trim();
        const coopIni = coop.split(/\s+/).filter(Boolean).map(w => w[0]).join('').toUpperCase();
        const lab = (nlabInput?.value || '').trim();
        const esp = (especieSelect?.value || '').trim();
        const eIni = esp ? esp[0].toUpperCase() : '';
        const yy = new Date().getFullYear().toString().slice(-2);
        const parts = [coopIni, lab, eIni, yy].filter(v => v !== '');
        loteInput.value = parts.join('-');
    }
    [cooperadorInput, nlabInput, especieSelect].forEach(el => {
        el && el.addEventListener('input', genLote);
        el && el.addEventListener('change', genLote);
    });
    genLote();

    // Asegurar may�sculas antes de enviar
    form.addEventListener('submit', () => {
        form.querySelectorAll('input[type="text"]').forEach(toUpper);
    });
})();
</script>
@endpush



