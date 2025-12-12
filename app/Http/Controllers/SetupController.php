<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class SetupController extends Controller
{
    public function status()
    {
        // luego lo completamos (si Postgres responde, si BD existe, etc.)
        return response()->json([
            'ok' => true,
            'step' => 'pending',
        ]);
    }

    public function testConnection(Request $request)
    {
        // luego lo completamos
        return response()->json(['ok' => true]);
    }

    public function initDatabase(Request $request)
    {
        // luego lo completamos (crear BD + migrate)
        return response()->json(['ok' => true]);
    }
}
