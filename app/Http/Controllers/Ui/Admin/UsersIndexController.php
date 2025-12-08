<?php

namespace App\Http\Controllers\Ui\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use App\Http\Controllers\Ui\Admin\Concerns\SerializesUsers;

class UsersIndexController extends AdminUiController
{
    use SerializesUsers;

    public function index(Request $request): InertiaResponse
    {
        $users = User::orderBy('name')
            ->get()
            ->sortByDesc(fn (User $user) => (bool) $user->is_admin)
            ->values()
            ->map(fn (User $user) => $this->serializeUser($user));

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }
}
