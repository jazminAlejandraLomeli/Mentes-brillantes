<?php

namespace App\Http\Requests\Admin;

use App\Support\Theme;
use Illuminate\Validation\Rule;

class ThemeRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $hex = ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'];
        $fonts = Rule::in(array_keys(Theme::FONTS));

        return [
            'primary' => $hex,
            'secondary' => $hex,
            'accent' => $hex,
            'background' => $hex,
            'text' => $hex,
            'heading_font' => ['required', $fonts],
            'body_font' => ['required', $fonts],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'primary' => 'color principal',
            'secondary' => 'color secundario',
            'accent' => 'color de acento',
            'background' => 'color de fondo',
            'text' => 'color del texto',
            'heading_font' => 'letra de títulos',
            'body_font' => 'letra de textos',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            '*.regex' => 'El :attribute debe ser un color en formato #RRGGBB.',
        ];
    }
}
