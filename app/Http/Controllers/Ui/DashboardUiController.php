<?php

namespace App\Http\Controllers\Ui;

use App\Http\Controllers\Controller;
use App\Models\AnalisisDocumento;
use App\Models\Cultivo;
use App\Models\Comunidad;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardUiController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $today = now()->toDateString();

        $totalHoy = AnalisisDocumento::whereDate('created_at', $today)->count();
        $pendientes = AnalisisDocumento::whereNull('estado')->count();
        $certificados = AnalisisDocumento::where('estado', 'APROBADO')->count();
        $rechazados = AnalisisDocumento::where('estado', 'RECHAZADO')->count();

        $chart = AnalisisDocumento::query()
            ->selectRaw("COALESCE(especie, recepcion->>'especie') as especie")
            ->selectRaw('COUNT(*) as total')
            ->groupByRaw("COALESCE(especie, recepcion->>'especie')")
            ->orderByDesc('total')
            ->limit(6)
            ->get()
            ->map(function ($row) {
                return [
                    'cultivo' => $row->especie ?: 'Sin especie',
                    'total' => (int) $row->total,
                ];
            });

        $recientes = AnalisisDocumento::query()
            ->orderByDesc('id')
            ->limit(5)
            ->get(['id', 'nlab', 'especie', 'fecha_evaluacion', 'recepcion', 'humedad', 'datos', 'estado', 'created_at'])
            ->map(function (AnalisisDocumento $doc) {
                $recepcion = $doc->recepcion ?? [];
                $humedad = $doc->humedad ?? [];
                $datos = $doc->datos ?? [];
                $especie = $doc->especie ?? ($recepcion['especie'] ?? 'Sin especie');
                $nlab = $doc->nlab ?? ($recepcion['nlab'] ?? 'N/A');
                $cooperador = $recepcion['cooperador'] ?? '-';
                $estado = $doc->estado ?? '-';
                $fecha = $doc->fecha_evaluacion ? $doc->fecha_evaluacion->format('d/m/Y') : ($doc->created_at?->format('d/m/Y'));
                $municipio = $recepcion['municipio'] ?? ($datos['municipio'] ?? '-');
                $comunidad = $recepcion['comunidad'] ?? ($datos['comunidad'] ?? '-');
                $bolsas = $recepcion['bolsas'] ?? ($datos['bolsas'] ?? null);
                $kgbol = $recepcion['kgbol'] ?? ($datos['kgbol'] ?? null);
                $total = $recepcion['total'] ?? ($datos['total'] ?? ($bolsas && $kgbol ? $bolsas * $kgbol : null));
                $germinacion = $humedad['germinacion_pct'] ?? ($datos['germinacion_pct'] ?? null);
                $humedadPct = $humedad['resultado'] ?? ($datos['resultado'] ?? null);
                $semillaPuraPct = $humedad['semilla_pura_pct']
                    ?? ($humedad['otros_sp_pct'] ?? ($datos['semilla_pura_pct'] ?? ($datos['otros_sp_pct'] ?? null)));
                $semillaPuraKg = $humedad['semilla_pura_kg']
                    ?? ($humedad['otros_sp_kg'] ?? ($datos['semilla_pura_kg'] ?? ($datos['otros_sp_kg'] ?? null)));
                $semillera = $recepcion['semillera'] ?? null;
                $validez = $doc->validez ?? ($datos['validez'] ?? ($humedad['validez'] ?? null));

                return [
                    'id' => $doc->id,
                    'especie' => $especie,
                    'nlab' => $nlab,
                    'cooperador' => $cooperador,
                    'estado' => $estado,
                    'municipio' => $municipio,
                    'comunidad' => $comunidad,
                    'fecha' => $fecha ?? '',
                    'bolsas' => $bolsas,
                    'kgbol' => $kgbol,
                    'total' => $total,
                    'germinacion' => $germinacion,
                    'humedad' => $humedadPct,
                    'semillaPuraPct' => $semillaPuraPct,
                    'semillaPuraKg' => $semillaPuraKg,
                    'semillera' => $semillera,
                    'validez' => $validez,
                ];
            });

        $cultivos = Cultivo::query()
            ->with([
                'variedades:id,cultivo_id,nombre',
                'validez:id,cultivo_id,dias',
            ])
            ->orderBy('especie')
            ->get()
            ->map(function (Cultivo $c) {
                return [
                    'id' => $c->id,
                    'especie' => $c->especie,
                    'variedades' => $c->variedades?->pluck('nombre')->filter()->values()->all() ?? [],
                    'validez' => $c->validez?->dias,
                    'certificado_inicial' => $c->categoria_inicial,
                    'certificado_final' => $c->categoria_final,
                ];
            });

        $comunidades = Comunidad::query()
            ->select('id', 'municipio', 'comunidad')
            ->orderBy('municipio')
            ->orderBy('comunidad')
            ->get();
        $totalComunidades = $comunidades->count();
        $totalMunicipios = $comunidades->pluck('municipio')->filter()->unique()->count();

        $userSessions = DB::table('sessions')
            ->whereNotNull('user_id')
            ->orderByDesc('last_activity')
            ->limit(6)
            ->get();
        $userIds = $userSessions->pluck('user_id')->filter()->unique()->values();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');
        $now = now();
        $userHistory = $userSessions
            ->map(function ($session) use ($users, $now) {
                $user = $users->get($session->user_id);
                if (!$user) {
                    return null;
                }

                $connectedAt = Carbon::createFromTimestamp($session->last_activity);
                $minutesAgo = max(0, $now->diffInMinutes($connectedAt));
                $connectionLabel = $minutesAgo === 0
                    ? 'Hace unos segundos'
                    : ($minutesAgo < 60
                        ? "Hace {$minutesAgo} min"
                        : 'Hace ' . round($minutesAgo / 60, 1) . ' h');

                return [
                    'id' => $session->id,
                    'user' => $user->name,
                    'email' => $user->email,
                    'connection' => $connectionLabel,
                    'details' => 'Actividad registrada recientemente',
                    'timestamp' => $connectedAt->format('d/m/Y H:i'),
                ];
            })
            ->filter()
            ->values()
            ->all();

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'totalHoy' => $totalHoy,
                'pendientes' => $pendientes,
                'certificados' => $certificados,
                'rechazados' => $rechazados,
                'comunidades' => $totalComunidades,
                'municipios' => $totalMunicipios,
                'userHistoryCount' => count($userHistory),
            ],
            'chart' => $chart,
            'recientes' => $recientes,
            'cultivos' => $cultivos,
            'comunidades' => $comunidades,
            'userHistory' => $userHistory,
        ]);
    }
}
