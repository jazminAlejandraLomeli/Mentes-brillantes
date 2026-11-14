<?php

namespace App\Services;

use App\Models\Setting;
use App\Support\Theme;
use App\Support\WhatsAppTemplates;

/**
 * Ajustes que Liz cambia desde el panel: colores, letras y mensajes.
 */
class SiteSettingsService
{
    /**
     * @param  array{primary: string, secondary: string, accent: string, background: string, text: string, heading_font: string, body_font: string}  $theme
     */
    public function updateTheme(array $theme): void
    {
        $theme = array_map(fn ($v) => str_starts_with((string) $v, '#') ? strtoupper((string) $v) : $v, $theme);

        Setting::setValue(Theme::SETTING_KEY, $theme);
    }

    /**
     * Regresa a "Arcoíris de Liz" con Quicksand + Nunito.
     */
    public function resetTheme(): void
    {
        Setting::setValue(Theme::SETTING_KEY, Theme::defaults());
    }

    /**
     * @param  array<string, string>  $templates
     */
    public function updateWhatsAppTemplates(array $templates): void
    {
        Setting::setValue(
            WhatsAppTemplates::SETTING_KEY,
            array_intersect_key($templates, WhatsAppTemplates::DEFAULTS),
        );
    }
}
