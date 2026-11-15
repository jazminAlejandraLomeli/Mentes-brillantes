<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

/**
 * Logo e icono del negocio, subidos desde el panel (Personalizar → Colores, letras y logo).
 * Si no hay logo, la página usa el arcoíris dibujado y public/favicon.svg.
 */
class BrandAssets
{
    public const SETTING_KEY = 'brand_assets';

    /**
     * @return array{logo: string|null, icon: string|null, apple_icon: string|null}
     */
    public static function paths(): array
    {
        $saved = Setting::getValue(self::SETTING_KEY, []);
        $saved = is_array($saved) ? $saved : [];

        return [
            'logo' => $saved['logo'] ?? null,
            'icon' => $saved['icon'] ?? null,
            'apple_icon' => $saved['apple_icon'] ?? null,
        ];
    }

    /**
     * URLs públicas para la página y el panel.
     *
     * @return array{logo_url: string|null, icon_url: string, apple_icon_url: string|null}
     */
    public static function urls(): array
    {
        $paths = self::paths();
        $url = fn (?string $path) => $path ? Storage::disk('public')->url($path) : null;

        return [
            'logo_url' => $url($paths['logo']),
            'icon_url' => $url($paths['icon']) ?? asset('favicon.svg'),
            'apple_icon_url' => $url($paths['apple_icon']),
        ];
    }
}
