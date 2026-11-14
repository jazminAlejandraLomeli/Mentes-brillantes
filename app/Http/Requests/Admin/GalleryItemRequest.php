<?php

namespace App\Http\Requests\Admin;

class GalleryItemRequest extends AdminRequest
{
    /**
     * Al crear se pueden subir varias fotos a la vez (images[]).
     * Al editar solo se cambia el texto o se reemplaza la foto.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        if ($this->isCreating()) {
            return [
                'images' => ['required', 'array', 'min:1', 'max:20'],
                'images.*' => self::IMAGE_RULES,
                'caption' => ['nullable', 'string', 'max:200'],
            ];
        }

        return [
            'caption' => ['nullable', 'string', 'max:200'],
            'is_active' => ['boolean'],
            'image' => ['nullable', ...self::IMAGE_RULES],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...parent::messages(),
            'images.required' => 'Elige al menos una foto.',
            'images.max' => 'Puedes subir hasta 20 fotos a la vez.',
            'images.*.max' => 'Una de las fotos pesa demasiado (máximo 8 MB).',
            'images.*.image' => 'Uno de los archivos no es una imagen.',
            'images.*.mimes' => 'Las fotos deben ser JPG, PNG o WebP.',
        ];
    }
}
