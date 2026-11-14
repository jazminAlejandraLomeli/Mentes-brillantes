<?php

namespace App\Http\Requests\Admin;

use App\Rules\MexicanPhone;
use App\Support\PhoneNumber;

class GuardianRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'whatsapp_phone' => ['required', 'string', new MexicanPhone],
            'email' => ['nullable', 'email', 'max:150'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'whatsapp_phone' => 'WhatsApp',
            'email' => 'correo',
            'notes' => 'notas',
        ];
    }

    /**
     * Guarda el teléfono siempre igual: 10 dígitos sin espacios ni +52.
     */
    protected function prepareForValidation(): void
    {
        if ($normalized = PhoneNumber::normalize($this->input('whatsapp_phone'))) {
            $this->merge(['whatsapp_phone' => $normalized]);
        }
    }
}
