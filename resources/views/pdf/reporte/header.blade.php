<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultado Oficial de Analisis de Semillas</title>
  @if($isPreview)
    <link rel="stylesheet" href="{{ asset('assets/css/reporte_pdf.css') }}">
  @endif
</head>
<body class="{{ $isPreview ? 'is-preview' : '' }}">
<div class="wrap">
  <div class="header">
    <div class="logo-left">
      <img src="{{ $img('images/logo2.png') }}" alt="Logo Estado Plurinacional de Bolivia">
    </div>
    <div class="logo-right">
      <img src="{{ $img('images/titulo.png') }}" alt="INIAF">
    </div>
  </div>

  <div class="hr-top"></div>

  <div class="heading-block">
    <div class="heading-grid">
      <h1>OFICINA DEPARTAMENTAL POTOSI</h1>
      <h2>RESULTADO OFICIAL DE ANALISIS DE SEMILLAS</h2>
    </div>
    <div class="heading-meta">
      @include('pdf.reporte.encabezado-datos')
    </div>
  </div>

  <div class="report-body">
