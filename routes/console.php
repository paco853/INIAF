<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('comunidades:export', function () {
    $rows = DB::table('comunidades')
        ->select('id', 'comunidad', 'municipio')
        ->orderBy('id')
        ->get()
        ->toArray();

    $json = json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    $path = public_path('comunidades_potosi.json');
    File::put($path, $json);

    $this->info('Comunidades exportadas a '.$path);
})->purpose('Exporta la tabla comunidades a public/comunidades_potosi.json');
