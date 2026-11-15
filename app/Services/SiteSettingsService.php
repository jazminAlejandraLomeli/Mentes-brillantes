<?php

namespace App\Services;

use App\Models\Setting;
use App\Support\BrandAssets;
use App\Support\ImageUploader;
use App\Support\Theme;
use App\Support\WhatsAppTemplates;
use Illuminate\Http\UploadedFile;

/**
 * Ajustes que se cambian desde el panel: colores, letras, logo y mensajes.
 */
class SiteSettingsService
{
    public function __construct(private ImageUploader $images) {}

    /**
     * @param  array{primary: string, secondary: string, accent: string, background: string, text: string, heading_font: string, body_font: string}  $theme
     */
    public function updateTheme(array $theme): void
    {
        $theme = array_map(fn ($v) => str_starts_with((string) $v, '#') ? strtoupper((string) $v) : $v, $theme);

        Setting::setValue(Theme::SETTING_KEY, $theme);
    }

    /**
     * Regresa a "Arcoíris" con Quicksand + Nunito.
     */
    public function resetTheme(): void
    {
        Setting::setValue(Theme::SETTING_KEY, Theme::defaults());
    }

    /**
     * Guarda el logo y genera los iconos para la pestaña del navegador (64 px)
     * y para cuando guardan la página en la pantalla del celular (180 px).
     */
    public function updateLogo(UploadedFile $file): void
    {
        $old = BrandAssets::paths();

        Setting::setValue(BrandAssets::SETTING_KEY, [
            'logo' => $this->images->store($file, 'brand', 800),
            'icon' => $this->images->storeSquareIcon($file, 'brand', 64),
            'apple_icon' => $this->images->storeSquareIcon($file, 'brand', 180),
        ]);

        foreach ($old as $path) {
            $this->images->delete($path);
        }
    }

    /**
     * Quita el logo: la página vuelve al arcoíris.
     */
    public function removeLogo(): void
    {
        foreach (BrandAssets::paths() as $path) {
            $this->images->delete($path);
        }

        Setting::setValue(BrandAssets::SETTING_KEY, []);
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
