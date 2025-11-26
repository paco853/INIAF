  <div class="table-responsive">
    <table>
      <colgroup>
        <col style="width:6%"><col style="width:6%"><col style="width:5%"><col style="width:6%">
        <col style="width:6%"><col style="width:6%"><col style="width:5%"><col style="width:4%">
        <col style="width:3%"><col style="width:3.5%"><col style="width:3.5%"><col style="width:3%">
        <col style="width:3%"><col style="width:3%"><col style="width:3%"><col style="width:4.5%">
        <col style="width:3%"><col style="width:4.5%"><col style="width:3%"><col style="width:5%">
        <col style="width:5%"><col style="width:5%"><col style="width:4.5%"><col style="width:6%">
      </colgroup>
      <thead>
        <tr>
          <th class="{{ $isPreview ? 'vertical' : '' }}" rowspan="2"><div>ANALISIS DE LAB.</div></th>
          <th rowspan="2">ESPECIE</th>
          <th rowspan="2">VARIEDAD</th>
          <th rowspan="2">ORIGEN</th>
          <th colspan="2">CATEGORIA</th>
          <th class="{{ $isPreview ? 'vertical' : '' }}" rowspan="2"><div>Nº AUT. IMPORT.</div></th>
          <th colspan="3">LOTE</th>
          <th colspan="1">HUMEDAD</th>
          <th colspan="2">SEMILLA PURA</th>
          <th colspan="2">SEMILLA OTROS CULTIVOS</th>
          <th colspan="2">SEMILLAS DE MALEZAS COMUNES</th>
          <th colspan="2">SEMILLAS DE MALEZAS PROHIBIDAS</th>
          <th class="{{ $isPreview ? 'vertical' : '' }}" rowspan="2"><div>GERMINACION</div></th>
          <th class="{{ $isPreview ? 'vertical' : '' }}" rowspan="2"><div>VIABILIDAD</div></th>
          <th class="{{ $isPreview ? 'vertical' : '' }}" rowspan="2"><div>APROBADO <br>RECHAZADO</div></th>
          <th class="{{ $isPreview ? 'vertical' : '' }}" rowspan="2"><div>FECHA EVALUACION</div></th>
          <th class="{{ $isPreview ? 'vertical' : '' }}" rowspan="2"><div>VALIDEZ <br> DEL <br> ANALISIS</div></th>
        </tr>
        <tr>
          <th>INICIAL</th>
          <th>FINAL</th>
          <th>N°</th>
          <th>KG</th>
          <th>Nº ENVASES</th>
          <th>%</th>
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
          <td style="text-align:center; vertical-align:middle;">{{ $fmt($doc->especie) }}</td>
          <td>{{ $fmt($r['variedad'] ?? null) }}</td>
          <td class="td" style="text-align:left">
            <div>COMUNIDAD {{ $fmt($r['comunidad'] ?? null) }}</div>
            <div>MUNICIPIO {{ $fmt($r['municipio'] ?? null) }}</div>
            @if(empty(trim((string)($r['comunidad'] ?? ''))) && empty(trim((string)($r['municipio'] ?? ''))))
              <div>{{ $fmt($r['origen'] ?? null) }}</div>
            @endif
          </td>

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
          <td>{{ $fmt($h['viabilidad_pct'] ?? ($h['variavilidad_pct'] ?? null)) }}</td>
          <td>{{ $fmt($doc->estado ?? null) }}</td>
          <td>{{ $fechaEv ?? optional($doc->fecha_evaluacion)->format('d/m/Y') }}</td>
          <td>{{ $fmt($doc->validez ?? null) }}</td>
        </tr>
        @php
          $defaultNocivas = 'EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS NOCIVAS O PROHIBIDAS';
          $defaultComunes = 'EN LA MUESTRA NO SE ENCONTRARON SEMILLAS DE MALEZAS COMUNES';
          $malezasNocivas = $doc->malezas_nocivas;
          $malezasComunes = $doc->malezas_comunes;
          $clean = static function ($value) {
              if (!is_string($value)) {
                  return $value;
              }
              $trimmed = trim($value);
              return ($trimmed === '' || $trimmed === '-') ? null : $trimmed;
          };
          $malezasNocivas = $clean($malezasNocivas);
          $malezasComunes = $clean($malezasComunes);
          $malezasNocivas = $fmt($malezasNocivas ?? $defaultNocivas);
          $malezasComunes = $fmt($malezasComunes ?? $defaultComunes);
        @endphp
        
        <tr class="tabla-extra tabla-extra--obs">
          <td colspan="19">
            <strong>OBSERVACIONES:</strong>
            <span>{{ $fmt($doc->observaciones ?? null) }}</span>
          </td>
         
        </tr>
        <tr class="tabla-extra tabla-extra--malezas">
          <td colspan="5"><strong>SEMILLAS DE MALEZAS NOCIVAS O PROHIBIDAS:</strong></td>
          <td colspan="5"><strong>SEMILLAS DE MALEZAS COMUNES:</strong></td>
   
        </tr>
        <tr class="tabla-extra tabla-extra--malezas">
          <td colspan="5"><span>{{ $malezasNocivas }}</span></td>
          <td colspan="5"><span>{{ $malezasComunes }}</span></td>
         
        </tr>
      </tbody>
    </table>
  </div>
