<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Support\Theme;
use App\Support\WhatsAppTemplates;
use Illuminate\Database\Seeder;

/**
 * Valores iniciales de los ajustes. No sobrescribe lo que Liz ya haya cambiado.
 */
class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $preset = Theme::PRESETS[Theme::DEFAULT_PRESET];

        $this->seedIfMissing(Theme::SETTING_KEY, [
            'primary' => $preset['primary'],
            'secondary' => $preset['secondary'],
            'accent' => $preset['accent'],
            'background' => $preset['background'],
            'text' => $preset['text'],
            'heading_font' => Theme::DEFAULT_HEADING_FONT,
            'body_font' => Theme::DEFAULT_BODY_FONT,
        ]);

        // Variables disponibles: {tutor} {alumno} {clase} {fecha} {hora} {firma}
        $this->seedIfMissing(WhatsAppTemplates::SETTING_KEY, WhatsAppTemplates::DEFAULTS);
    }

    private function seedIfMissing(string $key, mixed $value): void
    {
        if (Setting::query()->where('key', $key)->doesntExist()) {
            Setting::setValue($key, $value);
        }
    }
}
