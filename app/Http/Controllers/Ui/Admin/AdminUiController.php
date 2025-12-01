<?php

namespace App\Http\Controllers\Ui\Admin;

use App\Http\Controllers\Controller;

class AdminUiController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!$request->user() || !$request->user()->is_admin) {
                abort(403, 'Solo administradores.');
            }
            return $next($request);
        });
    }
}
