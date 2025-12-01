<?php

namespace App\Http\Middleware;

use App\Support\AccessConfig;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAccessToggle
{
    public function handle(Request $request, Closure $next, string $key): Response
    {
        if (!AccessConfig::allowed($key, $request->user())) {
            abort(403, 'Acceso no permitido para este módulo.');
        }

        return $next($request);
    }
}
