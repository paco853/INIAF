@extends('layouts.app_nav')

@section('title', 'Nueva Variedad')

@section('content')
    <div class="card form-card form-card--sm">
        <h2 class="card-title">NUEVA VARIEDAD</h2>

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

        <form class="grid-form grid-form--sm" method="POST" action="{{ route('variedades.store') }}">
            @csrf

            <h3 class="section-title">Datos de cultivo</h3>
            <div class="field">
                <label for="cultivo_id">Cultivo</label>
                <select id="cultivo_id" name="cultivo_id" required>
                    @foreach (($cultivos ?? []) as $cultivo)
                        <option value="{{ $cultivo->id }}" {{ (old('cultivo_id', $selectedCultivoId ?? null) == $cultivo->id) ? 'selected' : '' }}>{{ $cultivo->especie }}</option>
                    @endforeach
                </select>
            </div>

            <h3 class="section-title">Variedad</h3>
            <div id="varList" class="field" style="grid-column:1/-1;">
                <label>Variedad</label>
                <div id="varRows" style="display:flex; flex-direction:column; gap:8px;">
                    <div class="var-row" style="display:flex; gap:8px; align-items:center;">
                        <input id="variedad_0" name="variedad[]" type="text" value="{{ old('variedad.0') }}" autocomplete="off" required placeholder="Ej. Híbrido A" />
                        <button type="button" class="btn-danger" title="Quitar" onclick="(function(btn){const rows=document.getElementById('varRows');const row=btn.parentElement;if(rows && rows.children.length>1){rows.removeChild(row)}})(this)">–</button>
                    </div>
                </div>
                <div class="actions" style="justify-content:flex-start; margin:6px 0 0;">
                    <button type="button" class="btn-secondary" id="btnAddVar" title="Añadir otra">+</button>
                </div>
            </div>

            <div class="actions">
                <button class="btn-primary" type="submit">Guardar</button>
                <a class="btn-secondary" href="{{ route('variedades.index') }}">Cancelar</a>
            </div>
        </form>
    </div>
@endsection

@push('scripts')
<script>
(function(){
  const rows = document.getElementById('varRows');
  const addBtn = document.getElementById('btnAddVar');
  function makeRow(value){
    const wrap=document.createElement('div');
    wrap.className='var-row';
    wrap.style.display='flex';wrap.style.gap='8px';wrap.style.alignItems='center';
    const input=document.createElement('input');
    input.name='variedad[]';input.type='text';input.autocomplete='off';input.placeholder='Ej. Híbrido A';input.value=value||'';input.required=true;
    const remove=document.createElement('button');
    remove.type='button';remove.className='btn-danger';remove.textContent='–';remove.title='Quitar';
    remove.addEventListener('click',()=>{ if(rows.children.length>1) rows.removeChild(wrap); });
    wrap.appendChild(input);wrap.appendChild(remove);return wrap;
  }
  if(addBtn&&rows){
    addBtn.addEventListener('click',()=>{ const el=makeRow(''); rows.appendChild(el); el.querySelector('input')?.focus(); });
  }
  // Interceptar clicks en botones de quitar para confirmar antes de eliminar
  if(rows){
    rows.addEventListener('click', function(e){
      const btn = e.target.closest('button');
      if(!btn || !rows.contains(btn) || !btn.classList.contains('btn-danger')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const row = btn.closest('.var-row');
      if(row && rows.children.length>1){
        if(confirm('¿Está seguro que desea quitarlo?')){
          rows.removeChild(row);
        }
      }
    }, true);
  }
  try{ const oldVals = @json(old('variedad', [])); if(Array.isArray(oldVals)&&oldVals.length>1){ for(let i=1;i<oldVals.length;i++){ rows.appendChild(makeRow(oldVals[i]||'')); } } }catch(e){}
})();
</script>
@endpush
