<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComunidadPotosiSeeder extends Seeder
{
    public function run(): void
    {
        $path = public_path('comunidades_potosi.json');
        if (!is_file($path) || !is_readable($path)) {
            $this->command?->warn('comunidades_potosi.json no encontrado en public/');
            return;
        }

        $json = @file_get_contents($path);
        if ($json === false) {
            $this->command?->warn('No se pudo leer comunidades_potosi.json');
            return;
        }

        $data = json_decode($json, true);
        if (!is_array($data)) {
            $this->command?->warn('Formato inválido en comunidades_potosi.json');
            return;
        }

        // Soportar tanto un arreglo simple de comunidades como un objeto con la clave "comunidades".
        $rows = isset($data['comunidades']) && is_array($data['comunidades'])
            ? $data['comunidades']
            : (array_is_list($data) ? $data : null);

        if ($rows === null) {
            $this->command?->warn('Formato inválido en comunidades_potosi.json');
            return;
        }
        $chunks = array_chunk($rows, 500);
        foreach ($chunks as $chunk) {
            foreach ($chunk as $item) {
                $municipio = trim((string)($item['municipio'] ?? ''));
                $comunidad = trim((string)($item['comunidad'] ?? ''));
                if ($municipio === '' || $comunidad === '') {
                    continue;
                }
                DB::table('comunidades')->updateOrInsert(
                    ['municipio' => $municipio, 'comunidad' => $comunidad],
                    ['updated_at' => now(), 'created_at' => now()]
                );
            }
        }
    }
}
