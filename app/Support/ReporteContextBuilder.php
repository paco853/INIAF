<?php

namespace App\Support;

use App\Models\AnalisisDocumento;
use App\Models\DocumentoApariencia;
use App\Support\ReportePayload;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ReporteContextBuilder
{
    public static function build(AnalisisDocumento $doc, bool $isPreview): array
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

        $appearance = DocumentoApariencia::resolveForDocument($doc);
        Log::info('ReporteContextBuilder appearance resolved', [
            'doc_id' => $doc->id,
            'appearance_id' => $appearance?->id,
            'footer_text' => $appearance?->footer_text ?? null,
        ]);
        $appearanceContext = static::buildAppearanceContext($appearance, $isPreview);

        return [
            'doc' => $doc,
            'isPreview' => $isPreview,
            'r' => $r,
            'h' => $h,
            'fmt' => $fmt,
            'semillera' => $semillera,
            'fechaEv' => $fechaEv,
            'img' => $img,
            'appearance' => $appearanceContext,
        ];
    }

    public static function buildWithAppearance(
        AnalisisDocumento $doc,
        DocumentoApariencia $appearance,
        bool $isPreview,
    ): array {
        $context = static::build($doc, $isPreview);
        $context['appearance'] = static::buildAppearanceContext($appearance, $isPreview);
        return $context;
    }

    private static function buildAppearanceContext(?DocumentoApariencia $appearance, bool $isPreview): array
    {
        if ($appearance) {
            $appearance->loadMissing('laboratorios');
        }
        $logoLeftUrl = $appearance?->logo_left_path
            ? static::resolveLogoPath($appearance->logo_left_path, $isPreview)
            : null;
        $logoRightUrl = $appearance?->logo_right_path
            ? static::resolveLogoPath($appearance->logo_right_path, $isPreview)
            : null;
        $hasLaboratorios = false;
        if ($appearance && $appearance->relationLoaded('laboratorios')) {
            $hasLaboratorios = $appearance->laboratorios->isNotEmpty();
        } elseif ($appearance) {
            $hasLaboratorios = $appearance->laboratorios()->exists();
        }
        return [
            'id' => $appearance?->id,
            'logo_left' => $logoLeftUrl,
            'logo_right' => $logoRightUrl,
            'logo_left_path' => $appearance?->logo_left_path,
            'logo_right_path' => $appearance?->logo_right_path,
            'footer_text' => $appearance->footer_text ?? '',
            'has_laboratorios' => $hasLaboratorios,
        ];
    }

    private static function resolveLogoPath(?string $relativePath, bool $isPreview): ?string
    {
        if (!$relativePath) {
            return null;
        }

        if ($isPreview) {
            return Storage::disk('public')->url($relativePath);
        }

        $abs = storage_path('app/public/'.$relativePath);
        if (is_file($abs) && is_readable($abs)) {
            $mime = static::detectImageMime($abs);
            $data = @file_get_contents($abs);
            if ($data !== false) {
                return 'data:'.$mime.';base64,'.base64_encode($data);
            }
        }

        return Storage::disk('public')->url($relativePath);
    }

    private static function detectImageMime(string $path): string
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        return match ($ext) {
            'png' => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            default => 'application/octet-stream',
        };
    }

}
