<?php

namespace App\Http\Controllers\Ui\Admin;

use App\Http\Requests\StoreAdminUserRequest;
use App\Http\Requests\ToggleUserRequest;
use App\Http\Requests\UpdateAdminUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use App\Http\Controllers\Ui\Admin\Concerns\SerializesUsers;

class UsersManagementController extends AdminUiController
{
    use SerializesUsers;

    public function store(StoreAdminUserRequest $request)
    {
        $data = $request->validated();
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'active' => true,
        ]);

        if ($request->wantsJson() || $request->expectsJson()) {
            return response()->json([
                'user' => $this->serializeUser($user),
                'status' => 'Usuario creado.',
            ], 201);
        }

        return redirect()->route('ui.usuarios')->with('status', 'Usuario creado.');
    }

    public function edit(User $user): InertiaResponse
    {
        if ($user->is_admin) {
            abort(403, 'No puedes editar al administrador.');
        }

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function update(UpdateAdminUserRequest $request, User $user)
    {
        if ($user->is_admin) {
            abort(403, 'No puedes editar al administrador.');
        }

        $data = $request->validated();

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);
        $user->save();

        return redirect()->route('ui.usuarios')->with('status', 'Usuario actualizado.');
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->is_admin) {
            abort(403, 'No puedes eliminar al administrador.');
        }

        if ($request->user()->id === $user->id) {
            return back()->with('error', 'No puedes eliminar tu propia cuenta.');
        }

        $user->delete();

        return redirect()->route('ui.usuarios')->with('status', 'Usuario eliminado.');
    }

    public function toggle(ToggleUserRequest $request, User $user)
    {
        if (!$request->user()->is_admin) {
            abort(403);
        }

        if ($request->user()->id === $user->id) {
            return back()->with('error', 'No puedes cambiar tu propio estado.');
        }

        $user->active = !$user->active;
        $user->save();

        return back()->with('status', 'Estado actualizado');
    }
}
