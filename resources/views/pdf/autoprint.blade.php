@extends('layouts.app_nav')

@section('title', 'Imprimir Documento')

@section('content')
  <div class="card form-card" style="max-width:none">
    <div class="actions" style="margin-bottom:8px; display:flex; gap:8px; flex-wrap:wrap">
      <a class="btn-secondary" href="{{ route('documentos.index') }}">Volver</a>
      <a class="btn-secondary" href="{{ route('documentos.print', $doc) }}">Descargar PDF</a>
    </div>

    <div style="height:80vh; border:1px solid var(--border);">
      <iframe id="pdfFrame" src="{{ route('documentos.print', ['doc' => $doc, 'inline' => 1]) }}#toolbar=0" title="PDF" style="width:100%; height:100%; border:0"></iframe>
    </div>
  </div>
@endsection

@push('scripts')
<script>
  // Al cargar el iframe del PDF, intentar imprimir automáticamente
  (function(){
    const f = document.getElementById('pdfFrame');
    if(!f) return;
    f.addEventListener('load', function(){
      try {
        // Dar un pequeño margen para que el visor de PDF se inicialice
        setTimeout(function(){
          if (f.contentWindow) {
            f.contentWindow.focus();
            f.contentWindow.print();
          }
        }, 250);
      } catch(e) { /* silencioso */ }
    });
  })();
  </script>
@endpush

