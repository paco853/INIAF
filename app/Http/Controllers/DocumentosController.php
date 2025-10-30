<?php

namespace App\Http\Controllers;

use App\Models\AnalisisDocumento;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;
use Spatie\Browsershot\Browsershot;
use iio\libmergepdf\Merger;
use Illuminate\Support\Facades\Validator;

class DocumentosController extends Controller
{
    /** Lista paginada de documentos. */
    public function index(Request $request): View
    {
        $docs = AnalisisDocumento::latest('id')->paginate(20)->withQueryString();
        return view('documentos', compact('docs'));
    }

    /** Detalle de un documento. */
    public function show(AnalisisDocumento $doc): View
    {
        return view('documento_show', compact('doc'));
    }

    /** Elimina un documento. */
    public function destroy(AnalisisDocumento $doc): RedirectResponse
    {
        $doc->delete();
        return redirect()->route('documentos.index')->with('status', 'Documento eliminado');
    }

    /**
     * Genera y entrega el reporte.
     * - ?preview=1: HTML de previsualización
     * - ?autoprint=1: página que carga el PDF e invoca window.print()
     * - ?inline=1: PDF embebido (Content-Disposition: inline)
     * - default: descarga (attachment)
     */
    public function imprimir(Request $request, AnalisisDocumento $doc): Response|View
    {
        if ($request->boolean('preview')) {
            return view('pdf.reporte', ['doc' => $doc, 'isPreview' => true]);
        }

        if ($request->boolean('autoprint')) {
            return view('pdf.autoprint', ['doc' => $doc]);
        }

        try {
            $pdfBytes = $this->renderSinglePdf($doc);
        } catch (\Throwable $e) {
            return response('Error al generar PDF con Browsershot: '.$e->getMessage(), 500);
        }

        $filename = 'documento_'.$doc->id.'.pdf';
        if ($request->boolean('inline')) {
            return response($pdfBytes, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="'.$filename.'"',
            ]);
        }

        return response($pdfBytes, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    /** Formulario de edición básica. */
    public function edit(AnalisisDocumento $doc): View
    {
        return view('documentos_edit', compact('doc'));
    }

    /** Actualiza datos básicos del documento. */
    public function update(Request $request, AnalisisDocumento $doc): RedirectResponse
    {
        $data = $request->validate([
            'nlab' => ['nullable','string','max:50'],
            'especie' => ['nullable','string','max:150'],
            'fecha_evaluacion' => ['nullable','date'],
            'estado' => ['nullable','string','max:20'],
            'validez' => ['nullable','string','max:100'],
            'observaciones' => ['nullable','string'],
            'malezas_nocivas' => ['nullable','string','max:255'],
            'malezas_comunes' => ['nullable','string','max:255'],
            // Recepción (datos iniciales)
            'variedad' => ['nullable','string','max:150'],
            'semillera' => ['nullable','string','max:150'],
            'cooperador' => ['nullable','string','max:150'],
            'categoria_inicial' => ['nullable','string','max:100'],
            'categoria_final' => ['nullable','string','max:100'],
            'lote' => ['nullable','string','max:100'],
            'bolsas' => ['nullable','numeric','min:0'],
            'kgbol' => ['nullable','numeric','min:0'],
            'municipio' => ['nullable','string','max:150'],
            'comunidad' => ['nullable','string','max:150'],
            'aut_import' => ['nullable','string','max:150'],
            'resultado' => ['nullable','numeric'],
            'otros_sp_pct' => ['nullable','numeric'],
            'otros_sp_kg' => ['nullable','numeric'],
            'otros_cultivos_pct' => ['nullable','numeric'],
            'otros_cultivos_kg' => ['nullable','numeric'],
            'malezas_comunes_pct' => ['nullable','numeric'],
            'malezas_comunes_kg' => ['nullable','numeric'],
            'malezas_prohibidas_pct' => ['nullable','numeric'],
            'malezas_prohibidas_kg' => ['nullable','numeric'],
            'germinacion_pct' => ['nullable','numeric'],
            'variavilidad_pct' => ['nullable','numeric'],
        ]);

        // Actualizar bloque de recepción dentro del JSON
        $recepKeys = [
            'nlab','especie','variedad','semillera','cooperador','categoria_inicial','categoria_final','lote','bolsas','kgbol','municipio','comunidad','aut_import'
        ];
        $recepcion = $doc->recepcion ?? [];
        $rTouched = false;
        foreach ($recepKeys as $rk) {
            if ($request->has($rk)) { $recepcion[$rk] = $request->input($rk); $rTouched = true; }
        }
        if ($rTouched) {
            // Total calculado si bolsas y kgbol presentes
            $b = isset($recepcion['bolsas']) ? (float)$recepcion['bolsas'] : null;
            $k = isset($recepcion['kgbol']) ? (float)$recepcion['kgbol'] : null;
            if ($b !== null && $k !== null) { $recepcion['total'] = $b * $k; }
            $doc->recepcion = $recepcion;
        }

        $humKeys = ['resultado','otros_sp_pct','otros_sp_kg','otros_cultivos_pct','otros_cultivos_kg','malezas_comunes_pct','malezas_comunes_kg','malezas_prohibidas_pct','malezas_prohibidas_kg','germinacion_pct','variavilidad_pct'];
        $humedad = $doc->humedad ?? [];
        $touched = false;
        foreach ($humKeys as $k) {
            if ($request->has($k)) { $humedad[$k] = $request->input($k); $touched = true; }
        }
        if ($touched) { $doc->humedad = $humedad; }

        $doc->fill($data);
        $doc->save();

        return redirect()->route('documentos.index')->with('status', 'Documento actualizado');
    }

    /** Renderiza un solo documento a PDF (bytes) reutilizable para merge. */
    protected function renderSinglePdf(AnalisisDocumento $doc): string
    {
        // Render HTML de la vista
        $html = view('pdf.reporte', ['doc' => $doc, 'isPreview' => false])->render();

        // Inyectar CSS (inline) para PDF consistente
        $cssPath = public_path('assets/css/reporte_pdf.css');
        if (is_file($cssPath) && is_readable($cssPath)) {
            $css = @file_get_contents($cssPath);
            if ($css !== false) {
                $html = '<style type="text/css">'.$css.'</style>'.$html;
            }
        }

        // Forzar margen inferior en @page para que el footer suba
        $html = '<style>@page{ margin-bottom: 80mm !important; }</style>'.$html;

        // Paths opcionales (Windows) para Chrome/Node/NPM
        $chromePath = env('BROWSERSHOT_CHROME_PATH');
        $nodePath   = env('BROWSERSHOT_NODE_PATH');
        $npmPath    = env('BROWSERSHOT_NPM_PATH');

        // Footer con firmas + pie institucional + numeración
        $footerHtml = <<<'HTML'
<div style="width:100%; font-family: Arial, Helvetica, 'DejaVu Sans', sans-serif; font-size:9px; color:#111827; padding-top:0; margin-top:0;">

  <div style="width:100%; text-align:center; margin: -10px; padding-top:0; padding-bottom:10%;">
    <table style="width:100%; border-collapse:collapse; table-layout:fixed;">
      <tr>
        <td style="width:33.33%; text-align:center; vertical-align:bottom; padding:0 8px;">
          <div style="border-top:1px solid #9ca3af; width:40%; height:1px; margin:0 auto 6px;"></div>
          <div>FIRMA TÉCNICO LABORATORIO</div>
        </td>
        <td style="width:33.33%; text-align:center; vertical-align:bottom; padding:0 8px;">
          <div style="border-top:1px solid #9ca3af; width:40%; height:1px; margin:0 auto 6px;"></div>
          <div>FIRMA ENCARGADO SEMILLAS</div>
        </td>
        <td style="width:33.33%; text-align:center; vertical-align:bottom; padding:0 8px;">
          <div style="border-top:1px solid #9ca3af; width:40%; height:1px; margin:0 auto 6px;"></div>
          <div>VB RESP. DEPARTAMENTAL INIAF</div>
        </td>
      </tr>
    </table>
  </div>
  <div style="text-align:center; color:#6b7280; margin-top:1mm;padding-bottom:5%;">
   <hr style="height: 0px; width:80%; background-color: black;">

 DIRECCIÓN DEPARTAMENTAL <br> www.iniaf.gob.bo
  </div>
  <div style="height:1px;"></div>
  <!-- el espacio final ayuda a no colisionar con el contenido -->
</div>
HTML;

        $bs = Browsershot::html($html)
            ->showBackground()
            ->emulateMedia('screen')
            ->format('letter')
            ->landscape()
            ->margins(15, 15, 80, 15)
            ->showBrowserHeaderAndFooter()
            ->hideHeader()
            ->footerHtml($footerHtml)
            ->timeout(120);

        if (!empty($chromePath)) { $bs->setChromePath($chromePath); }
        if (!empty($nodePath))   { $bs->setNodeBinary($nodePath); }
        if (!empty($npmPath))    { $bs->setNpmBinary($npmPath); }

        return $bs->pdf();
    }

    /** Formulario de descarga general (merge por rango). */
    public function bulkForm(Request $request): View
    {
        return view('documentos_bulk');
    }

    /** Ejecuta la combinación y entrega un PDF con múltiples documentos. */
    public function bulkDownload(Request $request): Response
    {
        $data = $request->all();
        $v = Validator::make($data, [
            'modo' => 'required|in:nlab,gestion',
            'desde' => 'required|integer',
            'hasta' => 'required|integer',
        ], [
            'modo.required' => 'Seleccione un modo',
            'desde.required' => 'Defina un valor inicial',
            'hasta.required' => 'Defina un valor final',
        ]);
        $v->validate();

        $modo = $data['modo'];
        $desde = (int) $data['desde'];
        $hasta = (int) $data['hasta'];
        if ($desde > $hasta) { [$desde, $hasta] = [$hasta, $desde]; }

        $query = AnalisisDocumento::query();
        if ($modo === 'nlab') {
            $query->whereNotNull('nlab')->whereBetween('nlab', [$desde, $hasta])->orderBy('nlab');
        } else {
            // Por gestión (año de fecha_evaluacion)
            $query->whereNotNull('fecha_evaluacion')
                ->whereYear('fecha_evaluacion', '>=', $desde)
                ->whereYear('fecha_evaluacion', '<=', $hasta)
                ->orderBy('fecha_evaluacion');
        }

        $docs = $query->get();
        if ($docs->isEmpty()) {
            return response('No se encontraron documentos para el rango seleccionado', 404);
        }

        $merger = new Merger();
        foreach ($docs as $doc) {
            try {
                $bytes = $this->renderSinglePdf($doc);
                $merger->addRaw($bytes);
            } catch (\Throwable $e) {
                continue;
            }
        }

        $merged = $merger->merge();
        $filename = $modo.'_'.($desde).'_'.($hasta).'.pdf';
        return response($merged, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
