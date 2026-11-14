<?php

namespace App\Http\Requests\Admin;

class BannerRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'cta_label' => ['nullable', 'string', 'max:60'],
            'cta_url' => ['nullable', 'string', 'max:255', 'regex:/^(https?:\/\/|#|\/)/'],
            'is_active' => ['boolean'],
            'image' => [$this->isCreating() ? 'required' : 'nullable', ...self::IMAGE_RULES],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'título',
            'subtitle' => 'subtítulo',
            'cta_label' => 'texto del botón',
            'cta_url' => 'enlace del botón',
            'image' => 'imagen',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...parent::messages(),
            'image.required' => 'Sube una imagen para el banner.',
            'cta_url.regex' => 'El enlace debe empezar con https://, / o # (o déjalo vacío para abrir WhatsApp).',
        ];
    }
}
