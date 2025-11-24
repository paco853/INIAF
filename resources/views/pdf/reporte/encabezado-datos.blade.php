  <div class="meta-line">
    <div class="meta-col">
      <div><strong>SEMILLERA:</strong> {{ $fmt($semillera) }}</div>
      <div><strong>COOPERADOR:</strong> {{ $fmt($r['cooperador'] ?? null) }}</div>
      <div><strong>CULTIVO:</strong> {{ $fmt($doc->especie) }}</div>
    </div>
    <div class="meta-col meta-right">
      <div class="meta-nlab"><strong>N° DE ANALISIS:</strong> {{ $fmt($doc->nlab, '#'.$doc->id) }}</div>
      <div class="meta-year"><strong>AÑO:</strong> {{ optional($doc->fecha_evaluacion)->format('Y') }}</div>
      @php
        use Carbon\Carbon;
        $fechaLarga = null;
        if (!empty($fechaEv)) {
          try {
            $fechaLarga = Carbon::createFromFormat('d/m/Y', $fechaEv)
              ->locale('es')
              ->translatedFormat('j \\d\\e F \\d\\e Y');
          } catch (\Exception $e) {
            $fechaLarga = null;
          }
        }
        if (!$fechaLarga && !empty($doc->fecha_evaluacion)) {
          try {
            $fechaLarga = Carbon::parse($doc->fecha_evaluacion)
              ->locale('es')
              ->translatedFormat('j \\d\\e F \\d\\e Y');
          } catch (\Exception $e) {
            $fechaLarga = null;
          }
        }
      @endphp
      <div class="meta-date">POTOSÍ, {{ $fechaLarga ?? '-' }}</div>
    </div>
  </div>
