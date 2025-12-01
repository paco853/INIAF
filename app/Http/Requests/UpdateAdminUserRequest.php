<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdminUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->is_admin === true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('users', 'name')->ignore($this->route('user'))],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user')),
                'regex:/^[^\s@]+@[^\s@]+\.(?:com|bo|org|net)$/i',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Ese nombre de usuario ya existe.',
            'email.unique' => 'Ese correo ya está registrado.',
            'email.regex' => 'El correo debe terminar en .com, .bo, .org o .net.',
        ];
    }
}
