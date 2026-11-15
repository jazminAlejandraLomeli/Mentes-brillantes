<?php

namespace App\Http\Requests\Admin;

class LogoRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // PNG con fondo transparente se ve mejor; también acepta JPG y WebP
            'logo' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096', 'dimensions:min_width=64,min_height=64'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'logo.required' => 'Elige la imagen de tu logo.',
            'logo.image' => 'El archivo debe ser una imagen.',
            'logo.mimes' => 'El logo debe ser PNG, JPG o WebP (PNG con fondo transparente se ve mejor).',
            'logo.max' => 'El logo pesa demasiado (máximo 4 MB).',
            'logo.dimensions' => 'El logo es muy pequeño; usa uno de al menos 64 × 64 px.',
        ];
    }
}
