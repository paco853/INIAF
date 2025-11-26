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
use Illuminate\Validation\Rule;
use App\Support\DocumentosHelper;
use App\Support\ReportePayload;
use Dompdf\Dompdf;
use Dompdf\Options;

class DocumentosController extends Controller
{
    /** Crea un documento (store). */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nlab' => ['required','string','max:50'],
            'especie' => ['required','string','max:150'],
            'fecha_evaluacion' => ['required','date'],
            'estado' => ['required', Rule::in(['APROBADO','RECHAZADO', true, false, 1, 0, '1', '0'])],
            'validez' => ['nullable','string','max:100'],
            'observaciones' => ['nullable','string'],
            'malezas_nocivas' => ['nullable','string','max:255'],
            'malezas_comunes' => ['nullable','string','max:255'],
            // Recepción
            'variedad' => ['required','string','max:150'],
            'semillera' => ['nullable','string','max:150'],
            'cooperador' => ['nullable','string','max:150'],
            'categoria_inicial' => ['required','string','max:100'],
            'categoria_final' => ['required','string','max:100'],
            'lote' => ['required','string','max:100'],
            'bolsas' => ['required','numeric','min:0'],
            'kgbol' => ['required','numeric','min:0'],
            'municipio' => ['nullable','string','max:150'],
            'comunidad' => ['nullable','string','max:150'],
            'aut_import' => ['required','string','max:150'],
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
            'viabilidad_pct' => ['nullable','numeric'],
            'variavilidad_pct' => ['nullable','numeric'],
        ]);

        $doc = new AnalisisDocumento();
        $estado = $this->normalizeEstado($request->input('estado'));
        if ($estado !== null) {
            $data['estado'] = $estado;
        } else {
            unset($data['estado']);
        }

        $doc->fill($data);

        $recepcion = [
            'nlab' => $request->input('nlab'),
            'especie' => $request->input('especie'),
            'variedad' => $request->input('variedad'),
            'semillera' => $request->input('semillera'),
            'cooperador' => $request->input('cooperador'),
            'categoria_inicial' => $request->input('categoria_inicial'),
            'categoria_final' => $request->input('categoria_final'),
            'lote' => $request->input('lote'),
            'bolsas' => $request->input('bolsas'),
            'kgbol' => $request->input('kgbol'),
            'municipio' => $request->input('municipio'),
            'comunidad' => $request->input('comunidad'),
            'aut_import' => $request->input('aut_import'),
        ];
        $recepcion['origen'] = DocumentosHelper::buildOrigen($recepcion['comunidad'] ?? '', $recepcion['municipio'] ?? '');
        $b = isset($recepcion['bolsas']) ? (float)$recepcion['bolsas'] : null;
        $k = isset($recepcion['kgbol']) ? (float)$recepcion['kgbol'] : null;
        if ($b !== null && $k !== null) { $recepcion['total'] = $b * $k; }
        $doc->recepcion = $recepcion;

        $humKeys = ['resultado','otros_sp_pct','otros_sp_kg','otros_cultivos_pct','otros_cultivos_kg','malezas_comunes_pct','malezas_comunes_kg','malezas_prohibidas_pct','malezas_prohibidas_kg','germinacion_pct','viabilidad_pct'];
        $humedad = [];
        foreach ($humKeys as $k) {
            if ($request->has($k)) { $humedad[$k] = $request->input($k); }
        }
        if ($request->has('variavilidad_pct') && !$request->has('viabilidad_pct')) {
            $humedad['viabilidad_pct'] = $request->input('variavilidad_pct');
        }
        if (!empty($humedad)) { $doc->humedad = $humedad; }

        $doc->save();

        $redirectTo = $request->header('X-Inertia') ? route('ui.documentos') : route('documentos.index');
        return redirect($redirectTo)->with('status', 'Documento creado');
    }
    /** Lista paginada de documentos (redirecciona a la interfaz React). */
    public function index(Request $request): RedirectResponse
    {
        return redirect()->route('ui.documentos');
    }

    /** Detalle de un documento (redirige a la UI moderna). */
    public function show(AnalisisDocumento $doc): RedirectResponse
    {
        return redirect()->route('ui.documentos');
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
            return view('pdf.reporte', $this->buildReporteContext($doc, true));
        }

        if ($request->boolean('autoprint')) {
            return redirect()->route('ui.documentos.print', $doc);
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
        $fechaRaw = trim((string) $request->input('fecha_evaluacion', ''));
        if ($fechaRaw !== '' && preg_match('#^\\d{1,2}/\\d{1,2}/\\d{4}$#', $fechaRaw)) {
            $dt = \DateTime::createFromFormat('d/m/Y', $fechaRaw);
            if ($dt !== false) {
                $request->merge(['fecha_evaluacion' => $dt->format('Y-m-d')]);
            }
        }

        $numericNullable = [
            'bolsas','kgbol','resultado','otros_sp_pct','otros_sp_kg','otros_cultivos_pct','otros_cultivos_kg',
            'malezas_comunes_pct','malezas_comunes_kg','malezas_prohibidas_pct','malezas_prohibidas_kg',
            'germinacion_pct','viabilidad_pct','variavilidad_pct',
        ];
        foreach ($numericNullable as $key) {
            if ($request->exists($key) && trim((string) $request->input($key)) === '') {
                $request->merge([$key => null]);
            }
        }
        if ($request->exists('validez') && trim((string) $request->input('validez')) === '') {
            $request->merge(['validez' => null]);
        }
        if ($request->exists('aut_import') && trim((string) $request->input('aut_import')) === '') {
            $request->merge(['aut_import' => 'NINGUNO']);
        }
        foreach (['municipio','comunidad'] as $textNullable) {
            if ($request->exists($textNullable) && trim((string) $request->input($textNullable)) === '') {
                $request->merge([$textNullable => null]);
            }
        }

        $data = $request->validate([
            'nlab' => ['required','string','max:50'],
            'especie' => ['required','string','max:150'],
            'fecha_evaluacion' => ['required','date'],
            'estado' => ['required', Rule::in(['APROBADO','RECHAZADO', true, false, 1, 0, '1', '0'])],
            'validez' => ['nullable','string','max:100'],
            'observaciones' => ['nullable','string'],
            'malezas_nocivas' => ['nullable','string','max:255'],
            'malezas_comunes' => ['nullable','string','max:255'],
            // Recepción (datos iniciales)
            'variedad' => ['required','string','max:150'],
            'semillera' => ['nullable','string','max:150'],
            'cooperador' => ['nullable','string','max:150'],
            'categoria_inicial' => ['required','string','max:100'],
            'categoria_final' => ['required','string','max:100'],
            'lote' => ['required','string','max:100'],
            'bolsas' => ['nullable','numeric','min:0'],
            'kgbol' => ['nullable','numeric','min:0'],
            'municipio' => ['nullable','string','max:150'],
            'comunidad' => ['nullable','string','max:150'],
            'aut_import' => ['required','string','max:150'],
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
            'viabilidad_pct' => ['nullable','numeric'],
            'variavilidad_pct' => ['nullable','numeric'],
        ]);

        // Actualizar bloque de recepción dentro del JSON
        $recepKeys = [
            'nlab','especie','variedad','semillera','cooperador','categoria_inicial','categoria_final','lote','bolsas','kgbol','municipio','comunidad','aut_import'
        ];
        $recepcion = $doc->recepcion ?? [];
        $rTouched = false;
        foreach ($recepKeys as $rk) {
            if ($request->exists($rk)) { $recepcion[$rk] = $request->input($rk); $rTouched = true; }
        }
        if ($rTouched) {
            // Total calculado si bolsas y kgbol presentes
            $b = isset($recepcion['bolsas']) ? (float)$recepcion['bolsas'] : null;
            $k = isset($recepcion['kgbol']) ? (float)$recepcion['kgbol'] : null;
            $recepcion['origen'] = DocumentosHelper::buildOrigen($recepcion['comunidad'] ?? '', $recepcion['municipio'] ?? '');
            if ($b !== null && $k !== null) { $recepcion['total'] = $b * $k; }
            $doc->recepcion = $recepcion;
        }

        $humKeys = ['resultado','otros_sp_pct','otros_sp_kg','otros_cultivos_pct','otros_cultivos_kg','malezas_comunes_pct','malezas_comunes_kg','malezas_prohibidas_pct','malezas_prohibidas_kg','germinacion_pct','viabilidad_pct'];
        $humedad = $doc->humedad ?? [];
        if (array_key_exists('variavilidad_pct', $humedad) && !array_key_exists('viabilidad_pct', $humedad)) {
            $humedad['viabilidad_pct'] = $humedad['variavilidad_pct'];
        }
        unset($humedad['variavilidad_pct']);

        $touched = false;
        foreach ($humKeys as $k) {
            if ($request->exists($k)) { $humedad[$k] = $request->input($k); $touched = true; }
        }
        if ($request->exists('variavilidad_pct') && !$request->exists('viabilidad_pct')) {
            $humedad['viabilidad_pct'] = $request->input('variavilidad_pct');
            $touched = true;
        }
        if ($touched) { $doc->humedad = $humedad; }

        $estado = $this->normalizeEstado($request->input('estado'));
        if ($estado !== null) {
            $data['estado'] = $estado;
        } else {
            unset($data['estado']);
        }

        $doc->fill($data);
        // Limpia datos legados para que no se reinyecten valores antiguos como fallback.
        $doc->datos = null;
        $doc->save();

        $redirectTo = $request->header('X-Inertia') ? route('ui.documentos') : route('documentos.index');
        return redirect($redirectTo)->with('status', 'Documento actualizado');
    }

    protected function buildReporteContext(AnalisisDocumento $doc, bool $isPreview): array
    {
        $payload = ReportePayload::fromDocumento($doc);
        $r = $payload['recepcion'];
        $h = $payload['humedad'];
        $semillera = $payload['semillera'];
        $fechaEv = $payload['fecha_evaluacion_legible'];
        $fmt = static function ($value, $default = '-') {
            return isset($value) && $value !== '' ? $value : $default;
        };

        $img = function (string $path) use ($isPreview) {
            if ($isPreview) {
                return asset($path);
            }
            $abs = public_path($path);
            if (is_file($abs) && is_readable($abs)) {
                $ext = strtolower(pathinfo($abs, PATHINFO_EXTENSION));
                $mime = match ($ext) {
                    'png' => 'image/png',
                    'jpg', 'jpeg' => 'image/jpeg',
                    'gif' => 'image/gif',
                    'svg' => 'image/svg+xml',
                    default => 'application/octet-stream'
                };
                $data = @file_get_contents($abs);
                if ($data !== false) {
                    return 'data:'.$mime.';base64,'.base64_encode($data);
                }
            }
            return asset($path);
        };

        return [
            'doc' => $doc,
            'isPreview' => $isPreview,
            'r' => $r,
            'h' => $h,
            'fmt' => $fmt,
            'semillera' => $semillera,
            'fechaEv' => $fechaEv,
            'img' => $img,
        ];
    }

    /** Normaliza el estado recibido (string/bool/int) a APROBADO/RECHAZADO o null. */
    private function normalizeEstado(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_bool($value)) {
            return $value ? 'APROBADO' : 'RECHAZADO';
        }

        if (is_int($value)) {
            return $value === 1 ? 'APROBADO' : ($value === 0 ? 'RECHAZADO' : null);
        }

        if (is_string($value)) {
            $normalized = strtoupper(trim($value));
            if ($normalized === '1') {
                return 'APROBADO';
            }
            if ($normalized === '0') {
                return 'RECHAZADO';
            }
            if (in_array($normalized, ['APROBADO', 'RECHAZADO'], true)) {
                return $normalized;
            }
        }

        return null;
    }

    /** Renderiza un solo documento a PDF (bytes) reutilizable para merge. */
    protected function renderSinglePdf(AnalisisDocumento $doc): string
    {
        $baseContext = $this->buildReporteContext($doc, false);

        // Inyectar CSS (inline) para PDF consistente
        $cssPath = public_path('assets/css/reporte_pdf.css');
        $css = '';
        if (is_file($cssPath) && is_readable($cssPath)) {
            $css = (string) @file_get_contents($cssPath);
        }

        // HTML completo (Browsershot renderiza todo)
        $htmlFull = view('pdf.reporte', $baseContext)->render();

        // Paths opcionales (Windows) para Chrome/Node/NPM
        $chromePath = env('BROWSERSHOT_CHROME_PATH');
        $nodePath   = env('BROWSERSHOT_NODE_PATH');
        $npmPath    = env('BROWSERSHOT_NPM_PATH');

        $footerCss = $this->extractFooterCss($cssPath);
        $footerHtml = view('pdf.footer', [
            'footerCss' => $footerCss,
        ])->render();

        // Browsershot renderiza siempre el documento completo (incluye la tabla).
        $htmlForBs = $htmlFull;
        if ($css !== '') {
            $htmlForBs = '<style type="text/css">'.$css.'</style>'.$htmlForBs;
        }

        $bs = Browsershot::html($htmlForBs)
            ->showBackground()
            ->emulateMedia('screen')
            ->format('letter')
            ->landscape()
            ->margins(0, 0, 0, 0) // deja que el @page del CSS controle los márgenes
            ->showBrowserHeaderAndFooter()
            ->hideHeader()
            ->footerHtml($footerHtml)
            ->timeout(120);

        if (!empty($chromePath)) { $bs->setChromePath($chromePath); }
        if (!empty($nodePath))   { $bs->setNodeBinary($nodePath); }
        if (!empty($npmPath))    { $bs->setNpmBinary($npmPath); }

        $bsPdf = $bs->pdf();

        // Generar solo la tabla con Dompdf y unirla como segunda página (si está disponible y produce contenido)
        $tablePdf = null;
        if (class_exists(Dompdf::class)) {
            try {
                $dompdfOptions = new Options();
                $dompdfOptions->set('isRemoteEnabled', true);
                $dompdfOptions->set('isHtml5ParserEnabled', true);
                $dompdfOptions->set('defaultMediaType', 'print');
                $dompdf = new Dompdf($dompdfOptions);
                $dompdf->setPaper('letter', 'landscape');

                $htmlTable = view('pdf.reporte.tabla', $baseContext)->render();
                $htmlTableDoc = '<html><head>';
                if ($css !== '') {
                    $htmlTableDoc .= '<style>'.$css.'</style>';
                }
                $htmlTableDoc .= '</head><body>'.$htmlTable.'</body></html>';

                $dompdf->loadHtml($htmlTableDoc);
                $dompdf->render();
                $tablePdf = $dompdf->output();

                if (strlen($tablePdf) < 5000) {
                    $tablePdf = null;
                }
            } catch (\Throwable $e) {
                $tablePdf = null;
            }
        }

        if ($tablePdf === null) {
            return $bsPdf;
        }

        // Une ambos PDFs: primero cuerpo completo (Browsershot), luego tabla (Dompdf)
        $merger = new Merger();
        $merger->addRaw($bsPdf);
        $merger->addRaw($tablePdf);
        return $merger->merge();
    }

    /** Endpoint público para iniciar descarga general desde la UI. */
    public function bulkForm(Request $request): Response
    {
        return $this->bulkDownload($request);
    }

    /** Ejecuta la combinación y entrega un PDF con múltiples documentos. */
    public function bulkDownload(Request $request): Response
    {
        $request->validate([
            'modo' => 'required|in:nlab,gestion',
            'desde' => 'required',
            'hasta' => 'required',
        ], [
            'modo.required' => 'Seleccione un modo',
            'desde.required' => 'Defina un valor inicial',
            'hasta.required' => 'Defina un valor final',
        ]);

        $modo = $request->input('modo');
        $desde = $modo === 'gestion' ? (int) $request->input('desde') : $request->input('desde');
        $hasta = $modo === 'gestion' ? (int) $request->input('hasta') : $request->input('hasta');
        if ($desde > $hasta) { [$desde, $hasta] = [$hasta, $desde]; }

        $query = AnalisisDocumento::query();
        if ($modo === 'nlab') {
            $docs = $query->get()
                ->map(function ($doc) {
                    $doc->nlab_numeric = $this->normalizeNlabNumeric($this->resolveNlabValue($doc));
                    return $doc;
                })
                ->filter(function ($doc) use ($desde, $hasta) {
                    if ($doc->nlab_numeric === null) {
                        return false;
                    }
                    return $doc->nlab_numeric >= $desde && $doc->nlab_numeric <= $hasta;
                })
                ->sortBy('nlab_numeric')
                ->values();
            if ($docs->isEmpty()) {
                \Log::warning('Bulk download por nlab sin resultados', [
                    'desde' => $desde,
                    'hasta' => $hasta,
                    'ejemplos' => AnalisisDocumento::query()->limit(5)->pluck('nlab'),
                ]);
            }
        } else {
            // Por gestión (año de fecha_evaluacion)
            $docs = $query->whereNotNull('fecha_evaluacion')
                ->whereYear('fecha_evaluacion', '>=', $desde)
                ->whereYear('fecha_evaluacion', '<=', $hasta)
                ->orderBy('fecha_evaluacion')
                ->get();
        }

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

    private function normalizeNlabNumeric($value): ?int
    {
        if ($value === null) {
            return null;
        }
        $digits = preg_replace('/[^0-9]/', '', (string) $value);
        if ($digits === '') {
            return null;
        }
        $normalized = ltrim($digits, '0');
        if ($normalized === '') {
            return 0;
        }
        return (int) $normalized;
    }

    private function resolveNlabValue(AnalisisDocumento $doc)
    {
        if (!empty($doc->nlab)) {
            return $doc->nlab;
        }
        $recepcion = $doc->recepcion ?? [];
        if (!empty($recepcion['nlab'])) {
            return $recepcion['nlab'];
        }
        $datos = $doc->datos ?? [];
        return $datos['nlab'] ?? null;
    }

    /** Obtiene solo el bloque de CSS destinado al footer PDF. */
    protected function extractFooterCss(string $cssPath): string
    {
        if (!is_file($cssPath) || !is_readable($cssPath)) {
            return '';
        }

        $contents = @file_get_contents($cssPath);
        if ($contents === false) {
            return '';
        }

        if (preg_match('/\/\*\s*FOOTER_PDF_START\s*\*\/(.*?)\/\*\s*FOOTER_PDF_END\s*\*\//s', $contents, $matches)) {
            return trim($matches[1]);
        }

        return '';
    }
}
