<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Base de las validaciones del panel. Solo usuarios con sesión llegan aquí
 * (las rutas ya tienen el middleware "auth").
 */
abstract class AdminRequest extends FormRequest
{
    /** Reglas comunes para subir fotos (máx. 8 MB). */
    public const IMAGE_RULES = ['image', 'mimes:jpg,jpeg,png,webp', 'max:8192'];

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * ¿Es un registro nuevo? (la ruta no trae un modelo, ej. POST /panel/banners)
     */
    protected function isCreating(): bool
    {
        return empty($this->route()?->parameters());
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.max' => 'La imagen pesa demasiado (máximo 8 MB).',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.mimes' => 'La imagen debe ser JPG, PNG o WebP.',
        ];
    }
}
