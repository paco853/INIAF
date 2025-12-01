<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminLoginController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required'],
        ]);

        $normalizedUsername = Str::lower($data['username']);

        $admin = Admin::whereRaw('LOWER(name) = ?', [$normalizedUsername])->first();

        if (!$admin) {
            return $this->respondWithAdminError($request, 'Usuario o contraseña incorrectos.');
        }
        if (!$admin->active) {
            return $this->respondWithAdminError($request, 'Cuenta de administrador inactiva.');
        }
        if (!Hash::check($data['password'], $admin->password)) {
            return $this->respondWithAdminError($request, 'Contraseña incorrecta.');
        }

        $user = User::firstWhere('email', $admin->email);
        $adminName = $admin->name;

        $now = now();

        if (!$user) {
            $user = User::create([
                'name' => $adminName,
                'email' => $admin->email,
                'password' => Hash::make($data['password']),
            ]);
            $user->forceFill(['email_verified_at' => $now])->save();
        } else {
            $user->forceFill([
                'name' => $adminName,
            ])->save();
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    private function respondWithAdminError(Request $request, string $message)
    {
        $errors = ['admin_login' => $message];

        if (
            $request->boolean('admin_modal') ||
            $request->header('X-Inertia') ||
            $request->expectsJson() ||
            $request->ajax()
        ) {
            throw ValidationException::withMessages($errors);
        }

        return back()
            ->withErrors($errors)
            ->onlyInput('username');
    }
}
