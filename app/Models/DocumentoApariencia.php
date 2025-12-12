<?php

namespace App\Models;

use App\Models\AnalisisDocumento;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;

class DocumentoApariencia extends Model
{
    use HasFactory;

    protected $table = 'documento_apariencias';

    protected $fillable = [
        'logo_left_path',
        'logo_right_path',
        'footer_text',
        'is_active',
        'fecha_inicio',
        'fecha_fin',
        'es_defecto',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'es_defecto' => 'boolean',
    ];

    public function laboratorios(): HasMany
    {
        return $this->hasMany(AparienciaLaboratorio::class)->orderBy('numero_laboratorio');
    }

    public static function resolveForDocument(AnalisisDocumento $doc): ?self
    {
        $today = now()->format('Y-m-d');
        $labIdentifier = static::normalizeLab($doc->nlab);
        $docDate = optional($doc->fecha_evaluacion)->format('Y-m-d');

        if ($labIdentifier !== null) {
            $labAppearances = static::query()
                ->whereHas('laboratorios', function (Builder $query) use ($labIdentifier) {
                    $query->where('numero_laboratorio', $labIdentifier);
                })
                ->orderByDesc('created_at')
                ->get();
            foreach ($labAppearances as $labAppearance) {
                if (static::hasRange($labAppearance)) {
                    if (static::matchesDocumentDate($labAppearance, $docDate)) {
                        return $labAppearance;
                    }
                    continue;
                }
                return $labAppearance;
            }
        }

        $globalAppearance = static::query()
            ->whereDoesntHave('laboratorios')
            ->where(function (Builder $query) use ($today) {
                static::applyDateClause($query, $today);
            })
            ->latest('created_at')
            ->first();
        if ($globalAppearance) {
            return $globalAppearance;
        }

        if (static::hasEsDefectoColumn()) {
            $defaultAppearance = static::query()
                ->whereDoesntHave('laboratorios')
                ->where('es_defecto', true)
                ->latest('created_at')
                ->first();
            if ($defaultAppearance) {
                return $defaultAppearance;
            }
        }

        if (static::hasIsActiveColumn()) {
            $activeAppearance = static::query()
                ->whereDoesntHave('laboratorios')
                ->where('is_active', true)
                ->latest('created_at')
                ->first();
            if ($activeAppearance) {
                return $activeAppearance;
            }
        }

        return static::query()
            ->whereDoesntHave('laboratorios')
            ->latest('created_at')
            ->first();
    }

    private static function hasRange(DocumentoApariencia $appearance): bool
    {
        return $appearance->fecha_inicio !== null || $appearance->fecha_fin !== null;
    }

    private static function matchesDocumentDate(DocumentoApariencia $appearance, ?string $docDate): bool
    {
        if ($docDate === null) {
            return false;
        }
        $start = $appearance->fecha_inicio?->format('Y-m-d');
        $end = $appearance->fecha_fin?->format('Y-m-d');
        if ($start && $docDate < $start) {
            return false;
        }
        if ($end && $docDate > $end) {
            return false;
        }
        return true;
    }

    private static function normalizeLab(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        $trimmed = trim($value);
        if ($trimmed === '') {
            return null;
        }
        return strtoupper($trimmed);
    }

    private static function applyDateClause(Builder $query, string $today): void
    {
        $query->where(function (Builder $query) use ($today) {
            $query->where(function (Builder $sub) {
                $sub->whereNull('fecha_inicio')->whereNull('fecha_fin');
            })->orWhere(function (Builder $sub) use ($today) {
                $sub->whereNotNull('fecha_inicio')
                    ->whereNotNull('fecha_fin')
                    ->whereDate('fecha_inicio', '<=', $today)
                    ->whereDate('fecha_fin', '>=', $today);
            });
        });
    }

    private static function hasEsDefectoColumn(): bool
    {
        static $exists;
        if ($exists === null) {
            $exists = Schema::hasColumn('documento_apariencias', 'es_defecto');
        }
        return $exists;
    }

    private static function hasIsActiveColumn(): bool
    {
        static $exists;
        if ($exists === null) {
            $exists = Schema::hasColumn('documento_apariencias', 'is_active');
        }
        return $exists;
    }
}
