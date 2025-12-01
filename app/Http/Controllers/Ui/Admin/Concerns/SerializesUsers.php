<?php

namespace App\Http\Controllers\Ui\Admin\Concerns;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

trait SerializesUsers
{
    protected function serializeUser(User $user): array
    {
        $lastSession = DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderByDesc('last_activity')
            ->value('last_activity');

        $adminRecord = $user->admin;
        $isAdmin = (bool) $adminRecord;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => $isAdmin,
            'active' => $isAdmin ? (bool) $adminRecord->active : (bool) $user->active,
            'role' => $isAdmin ? 'Administrador' : 'Usuario',
            'last_seen' => $lastSession
                ? Carbon::createFromTimestamp($lastSession)->toDateTimeString()
                : null,
            'created_at' => optional($user->created_at)->toDateString(),
        ];
    }
}
