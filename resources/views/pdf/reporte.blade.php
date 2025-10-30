<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultado Oficial de Analisis de Semillas</title>
  @php $isPreview = request()->boolean('preview'); @endphp
  @if($isPreview)
    <link rel="stylesheet" href="{{ asset('assets/css/reporte_pdf.css') }}">
  @endif
  </head>
<body class="{{ request()->boolean('preview') ? 'is-preview' : '' }}">
@php
    $r = $doc->recepcion ?? [];
    $h = $doc->humedad ?? [];
    $fmt = function($v, $def='-'){ return isset($v) && $v !== '' ? $v : $def; };
    $fechaEv = optional($doc->fecha_evaluacion)->format('d/m/Y');

    // Resolver imÃ¡genes: en preview usar asset(); en PDF incrustar como data URI (base64)
    $img = function(string $path) use ($isPreview){
        if ($isPreview) {
            return asset($path);
        }
        $abs = public_path($path);
        if (is_file($abs) && is_readable($abs)) {
            $ext = strtolower(pathinfo($abs, PATHINFO_EXTENSION));
            $mime = match($ext) {
                'png' => 'image/png',
                'jpg', 'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                default => 'application/octet-stream'
            };
            $data = base64_encode(@file_get_contents($abs));
            if ($data !== false) {
                return 'data:'.$mime.';base64,'.$data;
            }
        }
        return asset($path);
    };
@endphp

<!-- Firmas y pie solo en PREVIEW (para PDF se aÃ±ade mediante CSS/HTML inline) -->
@if($isPreview)
  <div class="signatures" style="position: fixed; left:10mm; right:10mm; bottom:18mm; text-align:center; font-size:9px;">
    <div class="col" style="display:inline-block; width:33.333%; padding:0 8px; vertical-align:bottom;"><div class="line" style="border-top:1px solid #9ca3af; width:40%; height:1px; margin:0 auto 6px;"></div>FIRMA TÃ‰CNICO LABORATORIO</div>
    <div class="col" style="display:inline-block; width:33.333%; padding:0 8px; vertical-align:bottom;"><div class="line" style="border-top:1px solid #9ca3af; width:40%; height:1px; margin:0 auto 6px;"></div>FIRMA ENCARGADO SEMILLAS</div>
    <div class="col" style="display:inline-block; width:33.333%; padding:0 8px; vertical-align:bottom;"><div class="line" style="border-top:1px solid #9ca3af; width:40%; height:1px; margin:0 auto 6px;"></div>VB RESP. DEPARTAMENTAL INIAF</div>
  </div>
  <div class="footer-wrap" style="position: fixed; left:10mm; right:10mm; bottom:12mm; text-align:center; font-size:9px; color:#6b7280;">DIRECCIÃ“N DEPARTAMENTAL <br> www.iniaf.gob.bo</div>
@endif

<div class="wrap">
  <div class="header">
    <div class="logo-left">
      <img src="{{ $img('images/logo2.png') }}" alt="Logo Estado Plurinacional de Bolivia" style="height:25mm; width:auto;">
    </div>
    <div class="logo-right">
      <img src="{{ $img('images/titulo.png') }}" alt="INIAF" style="height:18mm; width:auto;">
    </div>
  </div>

  <div class="hr-top"></div>

  <h1>OFICINA DEPARTAMENTAL POTOSI</h1>
  <h2>RESULTADO OFICIAL DE ANALISIS DE SEMILLAS</h2>

  <div class="meta-line">
    <div class="meta-col">
      <div><strong>SEMILLERA:</strong> {{ $fmt($r['semillera'] ?? null) }}</div>
      <div><strong>COOPERADOR:</strong> {{ $fmt($r['cooperador'] ?? null) }}</div>
      <div><strong>CULTIVO:</strong> {{ $fmt($doc->especie) }}</div>
    </div>
    <div class="meta-col meta-right">
      <div><strong>N° DE ANALISIS:</strong> {{ $fmt($doc->nlab, '#'.$doc->id) }}</div>
      <div><strong>AÑO:</strong> {{ optional($doc->fecha_evaluacion)->format('Y') }}</div>
      <div>POTOSI, {{ $fechaEv ?? optional($doc->fecha_evaluacion)->format('d/m/Y') ?? '-' }}</div>
    </div>
  </div>

  <div class="table-responsive">
    <table>
      <colgroup>
        <col style="width:3.5%"><col style="width:6%"><col style="width:5%"><col style="width:6%">
        <col style="width:3%"><col style="width:3%"><col style="width:5%"><col style="width:4%">
        <col style="width:3%"><col style="width:3.5%"><col style="width:3.5%"><col style="width:3%">
        <col style="width:3%"><col style="width:3%"><col style="width:3%"><col style="width:4.5%">
        <col style="width:3%"><col style="width:4.5%"><col style="width:3%"><col style="width:5%">
        <col style="width:5%"><col style="width:4%"><col style="width:5.5%"><col style="width:6%">
      </colgroup>
      <thead>
        <tr>
          <th class="{{ request()->boolean('preview') ? 'vertical' : '' }}" rowspan="2"><div>ANALISIS DE LAB.</div></th>
          <th rowspan="2">ESPECIE</th>
          <th rowspan="2">VARIEDAD</th>
          <th rowspan="2">ORIGEN</th>
          <th colspan="2">CATEGORIA</th>
          <th class="{{ request()->boolean('preview') ? 'vertical' : '' }}" rowspan="2"><div>NÂº AUT. IMPORT.</div></th>
          <th rowspan="2">LOTE</th>
          <th rowspan="2">KG/BOL</th>
          <th rowspan="2">Nº BOLSAS</th>
          <th rowspan="2">HUMEDAD</th>
          <th colspan="2">OTRAS ESPECIES</th>
          <th colspan="2">OTROS CULTIVOS</th>
          <th colspan="2">MALEZAS COMUNES</th>
          <th colspan="2">MALEZAS PROHIBIDAS</th>
          <th class="{{ request()->boolean('preview') ? 'vertical' : '' }}" rowspan="2"><div>GERMINACION</div></th>
          <th class="{{ request()->boolean('preview') ? 'vertical' : '' }}" rowspan="2"><div>VIABILIDAD</div></th>
          <th class="{{ request()->boolean('preview') ? 'vertical' : '' }}" rowspan="2"><div>APROB./RECH.</div></th>
          <th class="{{ request()->boolean('preview') ? 'vertical' : '' }}" rowspan="2"><div>FECHA EVALUACION</div></th>
          <th class="{{ request()->boolean('preview') ? 'vertical' : '' }}" rowspan="2"><div>VALIDEZ <br> DEL <br> ANALISIS</div></th>
        </tr>
        <tr>
          <th>INICIAL</th>
          <th>FINAL</th>
          <th>%</th>
          <th>Nº/KG</th>
          <th>%</th>
          <th>Nº/KG</th>
          <th>%</th>
          <th>Nº/KG</th>
          <th>%</th>
          <th>Nº/KG</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ $fmt($doc->nlab, '#'.$doc->id) }}</td>
          <td>{{ $fmt($doc->especie) }}</td>
          <td>{{ $fmt($r['variedad'] ?? null) }}</td>
          <td>{{ $fmt($r['origen'] ?? null) }}</td>
          <td>{{ $fmt($r['categoria_inicial'] ?? null) }}</td>
          <td>{{ $fmt($r['categoria_final'] ?? null) }}</td>
          <td>{{ $fmt($r['aut_import'] ?? null) }}</td>
          <td>{{ $fmt($r['lote'] ?? null) }}</td>
          <td>{{ $fmt($r['kgbol'] ?? null) }}</td>
          <td>{{ $fmt($r['bolsas'] ?? null) }}</td>
          <td>{{ $fmt($h['resultado'] ?? null) }}</td>
          <td>{{ $fmt($h['otros_sp_pct'] ?? null) }}</td>
          <td>{{ $fmt($h['otros_sp_kg'] ?? null) }}</td>
          <td>{{ $fmt($h['otros_cultivos_pct'] ?? null) }}</td>
          <td>{{ $fmt($h['otros_cultivos_kg'] ?? null) }}</td>
          <td>{{ $fmt($h['malezas_comunes_pct'] ?? null) }}</td>
          <td>{{ $fmt($h['malezas_comunes_kg'] ?? null) }}</td>
          <td>{{ $fmt($h['malezas_prohibidas_pct'] ?? null) }}</td>
          <td>{{ $fmt($h['malezas_prohibidas_kg'] ?? null) }}</td>
          <td>{{ $fmt($h['germinacion_pct'] ?? null) }}</td>
          <td>{{ $fmt($h['viabilidad_pct'] ?? null) }}</td>
          <td>{{ $fmt($doc->estado ?? null) }}</td>
          <td>{{ $fechaEv ?? optional($doc->fecha_evaluacion)->format('d/m/Y') }}</td>
          <td>{{ $fmt($doc->validez ?? null) }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="note"><strong>OBSERVACIONES:</strong> {{ $fmt($doc->observaciones ?? null) }}</div>

  <div class="row-2">
    <div class="box"><strong>SEMILLAS DE MALEZAS NOCIVAS O PROHIBIDAS:</strong><br>{{ $fmt($doc->malezas_nocivas ?? null) }}</div>
    <div class="box"><strong>SEMILLAS DE MALEZAS COMUNES:</strong><br>{{ $fmt($doc->malezas_comunes ?? null) }}</div>
  </div>
</div> <!-- /.wrap -->

<!-- Footer y firmas para PDF se inyectan mediante el propio HTML, no hay header/footer nativos aquÃ­. -->


@if(request()->boolean('autoprint'))
  <script>
    window.addEventListener('load', function(){
      setTimeout(function(){
        try { window.print(); } catch(e) {}
      }, 150);
    });
  </script>
@endif
</body>
</html>
