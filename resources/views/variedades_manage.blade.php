@extends('layouts.app_nav')

@section('title', 'Gestionar Variedades')

@section('content')
    <div class="card form-card form-card--sm form-card--ghost">
        <h2 class="card-title card-title--center-lg">Cultivo — {{ $cultivo->especie }}</h2>

        @if (session('status'))
            <div class="alert-success" style="border-color:#bbf7d0;color:#065f46;background:#dcfce7;padding:10px 12px;border:1px solid;border-radius:10px;margin-bottom:10px;">
                {{ session('status') }}
            </div>
        @endif

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

        <form class="grid-form grid-form--sm" method="POST" action="{{ route('variedades.manage.update', $cultivo) }}">
            @csrf
            @method('PUT')

            <h3 class="section-title">Variedades</h3>
            <div id="varList" class="field" style="grid-column:1/-1;">
                <div id="varRows" style="display:flex; flex-direction:column; gap:8px;">
                    @php $oldList = old('variedad'); @endphp
                    @if (is_array($oldList))
                        @foreach ($oldList as $idx => $val)
                            <div class="var-row" style="display:flex; gap:8px; align-items:center;">
                                <input name="variedad[]" type="text" value="{{ $val }}" autocomplete="off" required placeholder="Ej. Hibrido A" />
                                <button type="button" class="btn-danger" title="Quitar" onclick="(function(btn){const rows=document.getElementById('varRows');const row=btn.parentElement;if(rows && rows.children.length>1){rows.removeChild(row)}})(this)">-</button>
                            </div>
                        @endforeach
                    @else
                        @forelse ($cultivo->variedades as $v)
                            <div class="var-row" style="display:flex; gap:8px; align-items:center;">
                                <input name="variedad[]" type="text" value="{{ $v->nombre }}" autocomplete="off" required placeholder="Ej. Hibrido A" />
                                <button type="button" class="btn-danger" title="Quitar" onclick="(function(btn){const rows=document.getElementById('varRows');const row=btn.parentElement;if(rows && rows.children.length>1){rows.removeChild(row)}})(this)">-</button>
                            </div>
                        @empty
                            <div class="var-row" style="display:flex; gap:8px; align-items:center;">
                                <input name="variedad[]" type="text" value="" autocomplete="off" required placeholder="Ej. Hibrido A" />
                                <button type="button" class="btn-danger" title="Quitar" onclick="(function(btn){const rows=document.getElementById('varRows');const row=btn.parentElement;if(rows && rows.children.length>1){rows.removeChild(row)}})(this)">-</button>
                            </div>
                        @endforelse
                    @endif
                </div>
                <div class="actions" style="justify-content:flex-start; margin:6px 0 0;">
                    <button type="button" class="btn-secondary" id="btnAddVar" title="Añadir otra">+</button>
                </div>
            </div>

            <div class="actions">
                <button class="btn-primary" type="submit">Actualizar</button>
                <a class="btn-secondary" href="{{ route('variedades.index') }}">Cancelar</a>
            </div>
        </form>
    </div>

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
    input.name='variedad[]';input.type='text';input.autocomplete='off';input.placeholder='Ej. Hibrido A';input.value=value||'';input.required=true;
    const remove=document.createElement('button');
    remove.type='button';remove.className='btn-danger';remove.textContent='-';remove.title='Quitar';
    remove.addEventListener('click',()=>{ if(rows.children.length>1) rows.removeChild(wrap); });
    wrap.appendChild(input);wrap.appendChild(remove);return wrap;
  }
  if(addBtn&&rows){ addBtn.addEventListener('click',()=>{ const el=makeRow(''); rows.appendChild(el); el.querySelector('input')?.focus(); }); }
  // Confirmación antes de quitar una fila
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
})();
</script>
@endpush
@endsection
