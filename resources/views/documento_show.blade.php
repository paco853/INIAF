@extends('layouts.app_nav')

@section('title', 'Resultado de Analisis')

@section('content')
    @php
        $r = $doc->recepcion ?? [];
        $h = $doc->humedad ?? [];
        $fmt = fn($v, $def='-') => isset($v) && $v !== '' ? $v : $def;
        $fechaEv = optional($doc->fecha_evaluacion)->format('d/m/Y');
    @endphp

    <div class="card form-card" style="max-width:none">
        <div style="padding:6px 8px 2px 8px">
            <h2 style="margin:0; text-align:center; font-size:18px; letter-spacing:.3px">RESULTADO OFICIAL DE ANALISIS DE SEMILLAS</h2>

            <div style="display:flex; justify-content:space-between; margin-top:12px; gap:16px; flex-wrap:wrap">
                <div style="line-height:1.4">
                    <div><strong>SEMILLERA:</strong> {{ $fmt($r['semillera'] ?? null) }}</div>
                    <div><strong>COOPERADOR:</strong> {{ $fmt($r['cooperador'] ?? null) }}</div>
                    <div><strong>CULTIVO:</strong> {{ $fmt($doc->especie) }}</div>
                </div>
                <div style="text-align:right; line-height:1.6">
                    <div><strong>N&ordm; DE ANALISIS:</strong> {{ $fmt($doc->nlab, '#'.$doc->id) }}</div>
                    <div><strong>A&Ntilde;O:</strong> {{ optional($doc->fecha_evaluacion)->format('Y') }}</div>
                    <div>{{ strtoupper(config('app.name', '')) }}</div>
                </div>
            </div>
        </div>

        <div style="overflow:auto; margin-top:10px">
            <table style="width:1600px; border-collapse:collapse; font-size:12px">
                <thead>
                    <tr>
                        <th class="th">ANALISIS DE LAB.</th>
                        <th class="th">ESPECIE</th>
                        <th class="th">VARIEDAD</th>
                        <th class="th">ORIGEN</th>
                        <th class="th">CATEGORIA INICIAL</th>
                        <th class="th">CATEGORIA FINAL</th>
                        <th class="th">N&ordm; AUT. IMPORT.</th>
                        <th class="th">LOTE</th>
                        <th class="th">KG</th>
                        <th class="th">N&ordm; ENVASES</th>
                        <th class="th">HUMEDAD %</th>
                        <th class="th">SEMILLA PURA %</th>
                        <th class="th">SEMILLA PURA N&ordm;/KG</th>
                        <th class="th">OTROS CULTIVOS %</th>
                        <th class="th">OTROS CULTIVOS N&ordm;/KG</th>
                        <th class="th">MALEZAS COMUNES %</th>
                        <th class="th">MALEZAS COMUNES N&ordm;/KG</th>
                        <th class="th">MALEZAS PROHIBIDAS %</th>
                        <th class="th">MALEZAS PROHIBIDAS N&ordm;/KG</th>
                        <th class="th">GERMINACION %</th>
                        <th class="th">VIABILIDAD %</th>
                        <th class="th">APROB./RECH.</th>
                        <th class="th">FECHA EVALUACION</th>
                        <th class="th">VALIDEZ DEL ANALISIS</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="td">{{ $fmt($doc->nlab, '#'.$doc->id) }}</td>
                        <td class="td">{{ $fmt($doc->especie) }}</td>
                        <td class="td">{{ $fmt($r['variedad'] ?? null) }}</td>
                        <td class="td">{{ $fmt($r['origen'] ?? null) }}</td>
                        <td class="td">{{ $fmt($r['categoria_inicial'] ?? null) }}</td>
                        <td class="td">{{ $fmt($r['categoria_final'] ?? null) }}</td>
                        <td class="td">{{ $fmt($r['aut_import'] ?? null) }}</td>
                        <td class="td">{{ $fmt($r['lote'] ?? null) }}</td>
                        <td class="td">{{ $fmt($r['kgbol'] ?? null) }}</td>
                        <td class="td">{{ $fmt($r['bolsas'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['resultado'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['otros_sp_pct'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['otros_sp_kg'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['otros_cultivos_pct'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['otros_cultivos_kg'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['malezas_comunes_pct'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['malezas_comunes_kg'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['malezas_prohibidas_pct'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['malezas_prohibidas_kg'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['germinacion_pct'] ?? null) }}</td>
                        <td class="td">{{ $fmt($h['variavilidad_pct'] ?? null) }}</td>
                        <td class="td">{{ $fmt($doc->estado ?? null) }}</td>
                        <td class="td">{{ $fechaEv }}</td>
                        <td class="td">{{ $fmt($doc->validez ?? null) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style="margin-top:12px; font-size:12px">
            <div><strong>OBSERVACIONES:</strong> {{ $fmt($doc->observaciones ?? null) }}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px">
                <div><strong>SEMILLAS DE MALEZAS NOCIVAS O PROHIBIDAS:</strong><br>{{ $fmt($doc->malezas_nocivas ?? null) }}</div>
                <div><strong>SEMILLAS DE MALEZAS COMUNES:</strong><br>{{ $fmt($doc->malezas_comunes ?? null) }}</div>
            </div>
        </div>

        <style>
            .th{ border:1px solid #d1d5db; padding:6px; background:#f9fafb; font-weight:700 }
            .td{ border:1px solid #e5e7eb; padding:6px; text-align:center }
        </style>

        <div class="actions" style="margin-top:14px">
            <a class="btn-secondary" href="{{ route('documentos.index') }}">Volver</a>
            <a class="btn-secondary" href="{{ route('documentos.print', ['doc' => $doc, 'autoprint' => 1]) }}" target="_blank" rel="noopener">Imprimir</a>
            <a class="btn-primary" href="{{ route('documentos.print', $doc) }}" download="documento_{{ $doc->id }}.pdf">Descargar</a>
            <a class="btn-secondary" href="{{ route('documentos.print', ['doc' => $doc, 'inline' => 1]) }}" target="_blank" rel="noopener">Ver PDF</a>
        </div>
    </div>
@endsection

@push('scripts')
<script>
// Descarga directa: el backend ya envía Content-Disposition: attachment.
// El atributo `download` sugiere el nombre del archivo.
</script>
@endpush
