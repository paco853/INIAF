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
  @php
    $useAppearanceLogos = data_get($appearance, 'force_header_logos', false)
        || data_get($appearance, 'has_laboratorios', false);
    $logoLeftUrl = $useAppearanceLogos && data_get($appearance, 'logo_left')
        ? data_get($appearance, 'logo_left')
        : $img('images/logo2.png');
    $logoRightUrl = $useAppearanceLogos && data_get($appearance, 'logo_right')
        ? data_get($appearance, 'logo_right')
        : $img('images/titulo.png');
  @endphp
  <div class="header-row">
    <div class="logo-left">
      <img class="logo-img" src="{{ $logoLeftUrl }}" alt="Logo izquierdo">
    </div>
    <div class="logo-right">
      <img class="logo-img" src="{{ $logoRightUrl }}" alt="Logo derecho">
    </div>
  </div>

  <div class="header-line"></div>

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
