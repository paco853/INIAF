<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $adminEmail = env('ADMIN_EMAIL', 'admin@gmail.com');
        $now = now();

        DB::table('users')->updateOrInsert(
            ['id' => 1],
            [
                'name' => 'Admin',
                'email' => $adminEmail,
                'email_verified_at' => $now,
                'password' => Hash::make('admin'),
                'remember_token' => Str::random(10),
                'active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        );

        $this->call([
            ComunidadPotosiSeeder::class,
        ]);
    }
}
