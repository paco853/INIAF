<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Support\Str;

class UserLoginController extends Controller
{
    public function showLogin(): InertiaResponse
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required'],
        ]);

        $username = Str::lower($data['username']);

        $user = User::whereRaw('LOWER(name) = ?', [$username])->first();
        $remember = $request->boolean('remember');

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return back()->withErrors([
                'login' => 'Usuario o contraseña incorrectos. Intenta nuevamente.',
            ])->onlyInput('username');
        }

        Auth::login($user, $remember);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
