<?php

namespace App\Http\Requests\Admin;

use App\Rules\MexicanPhone;
use App\Support\PhoneNumber;

class TeacherRequest extends AdminRequest
{
    public const MAX_SPECIALTIES = 12;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'full_name' => ['nullable', 'string', 'max:150'],
            'title' => ['nullable', 'string', 'max:150'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'education' => ['nullable', 'string', 'max:3000'],
            'specialties' => ['nullable', 'array', 'max:'.self::MAX_SPECIALTIES],
            'specialties.*' => ['string', 'max:40', 'distinct'],
            'photo' => ['nullable', ...self::IMAGE_RULES],
            'remove_photo' => ['boolean'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'whatsapp_phone' => ['nullable', 'string', new MexicanPhone],
            'is_active' => ['boolean'],
            'show_on_website' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'full_name' => 'nombre completo',
            'title' => 'título o profesión',
            'bio' => 'trayectoria',
            'education' => 'formación',
            'specialties' => 'especialidades',
            'photo' => 'foto',
            'color' => 'color',
            'whatsapp_phone' => 'WhatsApp',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...parent::messages(),
            'photo.max' => 'La foto pesa demasiado (máximo 8 MB).',
            'photo.image' => 'El archivo debe ser una imagen.',
            'photo.mimes' => 'La foto debe ser JPG, PNG o WebP.',
            'color.regex' => 'Elige un color de la lista.',
            'specialties.max' => 'Puedes poner hasta '.self::MAX_SPECIALTIES.' especialidades.',
            'specialties.*.max' => 'Cada especialidad puede tener hasta 40 letras.',
            'specialties.*.distinct' => 'Hay una especialidad repetida.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Limpia especialidades vacías y espacios de más
        $specialties = collect((array) $this->input('specialties', []))
            ->map(fn ($s) => trim((string) $s))
            ->filter()
            ->values()
            ->all();

        $this->merge([
            'color' => strtoupper((string) ($this->input('color') ?: '#4BBBE5')),
            'specialties' => $specialties,
        ]);

        if ($normalized = PhoneNumber::normalize($this->input('whatsapp_phone'))) {
            $this->merge(['whatsapp_phone' => $normalized]);
        }
    }

    /**
     * Datos para el modelo (sin la foto, que se guarda aparte).
     *
     * @return array<string, mixed>
     */
    public function teacherData(): array
    {
        return collect($this->validated())->except(['photo', 'remove_photo'])->all();
    }
}
