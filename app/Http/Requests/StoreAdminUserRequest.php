<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->is_admin === true;
    }

    public function rules(): array
    {
        $adminEmail = env('ADMIN_EMAIL');

        return [
            'name' => ['required', 'string', 'max:255', 'unique:users,name'],
            'email' => array_filter([
                'required',
                'email',
                'max:255',
                'unique:users,email',
                'regex:/^[^\s@]+@[^\s@]+\.(?:com|bo|org|net)$/i',
                $adminEmail ? function ($attribute, $value, $fail) use ($adminEmail) {
                    if (mb_strtolower($value) === mb_strtolower($adminEmail)) {
                        $fail('No puedes usar el correo de administrador.');
                    }
                } : null,
            ]),
            'password' => ['required', 'confirmed', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Ese nombre de usuario ya existe.',
            'email.unique' => 'Ese correo ya está registrado.',
            'email.regex' => 'El correo debe terminar en .com, .bo, .org o .net.',
            'password.min' => 'La contraseña debe tener mínimo 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ];
    }
}
