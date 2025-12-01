<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
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

        Admin::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin'),
                'remember_token' => Str::random(10),
                'active' => true,
            ]
        );

        User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Admin',
                'email_verified_at' => now(),
                'password' => Hash::make('admin'),
                'remember_token' => Str::random(10),
            ]
        );

        $this->call([
            ComunidadPotosiSeeder::class,
        ]);
    }
}
