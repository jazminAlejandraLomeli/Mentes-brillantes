<?php

namespace App\Http\Requests\Admin;

use App\Rules\MexicanPhone;
use App\Support\PhoneNumber;

class LocationRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:300'],
            'landmark' => ['nullable', 'string', 'max:200'],
            'schedule' => ['nullable', 'string', 'max:1000'],
            'whatsapp_phone' => ['nullable', 'string', new MexicanPhone],
            'maps_url' => ['nullable', 'url:https', 'max:500'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'address' => 'dirección',
            'landmark' => 'referencias',
            'schedule' => 'horario',
            'whatsapp_phone' => 'WhatsApp',
            'maps_url' => 'enlace de Google Maps',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...parent::messages(),
            'address.required' => 'Escribe la dirección para que los papás sepan cómo llegar.',
            'maps_url.url' => 'Pega el enlace completo de Google Maps (empieza con https://).',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'address' => trim(preg_replace('/\s+/', ' ', (string) $this->input('address'))),
            'maps_url' => trim((string) $this->input('maps_url')) ?: null,
        ]);

        if ($normalized = PhoneNumber::normalize($this->input('whatsapp_phone'))) {
            $this->merge(['whatsapp_phone' => $normalized]);
        }
    }
}
