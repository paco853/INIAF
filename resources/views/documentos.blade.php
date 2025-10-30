@extends('layouts.app_nav')

@section('title', 'Documentos')

@section('content')
    <div class="card form-card">
        <h2 class="card-title">Documentos</h2>

        @if (session('status'))
            <div class="alert-success">{{ session('status') }}</div>
        @endif

        <div class="actions" style="justify-content:flex-end;margin-bottom:8px">
            <a class="btn btn--sm btn--soft" href="{{ route('documentos.bulk') }}" title="Descargar varios en un PDF">Descarga general</a>
        </div>

        <div class="grid-form" style="grid-template-columns:1fr; gap:0">
            <div class="field" style="overflow:auto">
                <table class="table table--rounded">
                    <thead>
                        <tr>
                            <th>Nº Análisis</th>
                            <th>Especie</th>
                            <th>Fecha de evaluación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($docs as $doc)
                            <tr>
                                <td><span class="badge">{{ $doc->nlab ?? ('#'.$doc->id) }}</span></td>
                                <td>{{ $doc->especie }}</td>
                                <td>{{ optional($doc->fecha_evaluacion)->format('Y-m-d') }}</td>
                                <td class="actions-cell">
                                    <div class="btn-group">
                                        <a class="btn btn--sm btn--soft" href="{{ route('documentos.print', ['doc' => $doc, 'preview' => 1]) }}" title="Vista previa">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                            Ver
                                        </a>
                                        <a class="btn btn--sm btn--soft" href="{{ route('documentos.edit', $doc) }}" title="Editar">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                            Editar
                                        </a>
                                        <a class="btn btn--sm btn--soft" href="{{ route('documentos.print', ['doc' => $doc, 'autoprint' => 1]) }}" target="_blank" rel="noopener" title="Abrir para imprimir">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                                            Imprimir
                                        </a>
                                        <a class="btn btn--sm btn--soft" href="{{ route('documentos.print', $doc) }}" download="documento_{{ $doc->id }}.pdf" title="Descargar PDF">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                                            Descargar
                                        </a>
                                        <a class="btn btn--sm btn--soft" href="{{ route('documentos.print', ['doc' => $doc, 'inline' => 1]) }}" target="_blank" rel="noopener" title="Abrir PDF en el navegador">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>
                                            Abrir
                                        </a>
                                    </div>
                                    <form method="POST" action="{{ route('documentos.destroy', $doc) }}" onsubmit="return confirm('¿Eliminar documento?')" style="display:inline">
                                        @csrf
                                        @method('DELETE')
                                        <button class="btn-danger btn--sm" type="submit" title="Eliminar">
                                            Eliminar
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr><td colspan="4" style="padding:12px; color:var(--muted)">Sin documentos</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div style="margin-top:12px">{{ $docs->links() }}</div>
    </div>
@endsection

@push('scripts')
<script>
// Descarga directa: el backend envía Content-Disposition: attachment.
// El atributo `download` sugiere el nombre del archivo.
</script>
@endpush
