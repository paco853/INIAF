<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento {{ $doc->nlab ?? ('#'.$doc->id) }}</title>
    <style>
        /* Usar DejaVu Sans para mejor soporte de caracteres en DomPDF */
        body{ font-family: 'DejaVu Sans', Arial, sans-serif; margin:30px; }
        h1{ margin:0 0 10px; font-size:20px }
        .meta{ margin-bottom:16px }
        .row{ display:flex; gap:16px }
        .col{ flex:1 }
        .card{ border:1px solid #ccc; padding:12px; border-radius:8px; margin-top:12px }
        .label{ font-weight:bold }
        pre{ background:#f7f7f7; padding:10px; border-radius:6px; overflow:auto }
        @media print{ .no-print{ display:none } }
    </style>
    </head>
<body>
    <div class="no-print" style="margin-bottom:10px"><button onclick="window.print()">Imprimir</button></div>
    <h1>Documento {{ $doc->nlab ?? ('#'.$doc->id) }}</h1>
    <div class="meta row">
        <div class="col"><span class="label">Especie:</span> {{ $doc->especie }}</div>
        <div class="col"><span class="label">Fecha de evaluación:</span> {{ optional($doc->fecha_evaluacion)->format('Y-m-d') }}</div>
        <div class="col"><span class="label">Estado:</span> {{ $doc->estado }}</div>
    </div>
    <div class="card">
        <div class="label">Validez del análisis</div>
        <div>{{ $doc->validez }}</div>
    </div>
    <div class="card">
        <div class="label">Observaciones</div>
        <div>{{ $doc->observaciones }}</div>
    </div>
    <div class="card row">
        <div class="col"><div class="label">Malezas nocivas/prohibidas</div>{{ $doc->malezas_nocivas }}</div>
        <div class="col"><div class="label">Malezas comunes</div>{{ $doc->malezas_comunes }}</div>
    </div>
    <div class="card">
        <div class="label">Recepción</div>
        <pre>{{ json_encode($doc->recepcion, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE) }}</pre>
    </div>
    <div class="card">
        <div class="label">Registro Semillas</div>
        <pre>{{ json_encode($doc->humedad, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE) }}</pre>
    </div>
</body>
</html>
