<?php

namespace App\Support;

use App\Models\Setting;

/**
 * Colores y tipografías de la página, editables por Liz desde el panel.
 *
 * Se guardan en la tabla `settings` (clave "theme") y se convierten en
 * variables CSS (--brand-*) que Tailwind usa en clases como bg-brand-primary.
 */
class Theme
{
    public const SETTING_KEY = 'theme';

    /**
     * Tipografías disponibles (todas de Google Fonts).
     * "stack" es la fuente de respaldo si la principal no carga.
     *
     * @var array<string, array{label: string, google: string, stack: string, style: string}>
     */
    public const FONTS = [
        'quicksand' => ['label' => 'Quicksand', 'google' => 'Quicksand:wght@400;500;600;700', 'stack' => 'sans-serif', 'style' => 'Redondeada (la de tus posts)'],
        'fredoka' => ['label' => 'Fredoka', 'google' => 'Fredoka:wght@400;500;600;700', 'stack' => 'sans-serif', 'style' => 'Redondeada y gordita'],
        'baloo-2' => ['label' => 'Baloo 2', 'google' => 'Baloo+2:wght@400;500;600;700', 'stack' => 'sans-serif', 'style' => 'Divertida, tipo cuento'],
        'comfortaa' => ['label' => 'Comfortaa', 'google' => 'Comfortaa:wght@400;500;600;700', 'stack' => 'sans-serif', 'style' => 'Redondeada y suave'],
        'sniglet' => ['label' => 'Sniglet', 'google' => 'Sniglet:wght@400;800', 'stack' => 'sans-serif', 'style' => 'Burbuja infantil'],
        'gochi-hand' => ['label' => 'Gochi Hand', 'google' => 'Gochi+Hand', 'stack' => 'cursive', 'style' => 'A mano, tipo crayón (como el logo)'],
        'patrick-hand' => ['label' => 'Patrick Hand', 'google' => 'Patrick+Hand', 'stack' => 'cursive', 'style' => 'A mano, tipo cuaderno'],
        'nunito' => ['label' => 'Nunito', 'google' => 'Nunito:wght@400;500;600;700;800', 'stack' => 'sans-serif', 'style' => 'Muy legible para textos'],
        'poppins' => ['label' => 'Poppins', 'google' => 'Poppins:wght@400;500;600;700', 'stack' => 'sans-serif', 'style' => 'Moderna y limpia'],
        'lexend' => ['label' => 'Lexend', 'google' => 'Lexend:wght@400;500;600;700', 'stack' => 'sans-serif', 'style' => 'Fácil de leer para niños'],
    ];

    /**
     * Combinaciones pastel listas para elegir con un clic.
     * "arcoiris" está medida del logo y los posts de Instagram de Mentes Brillantes.
     *
     * @var array<string, array{label: string, primary: string, secondary: string, accent: string, background: string, text: string}>
     */
    public const PRESETS = [
        'arcoiris' => ['label' => 'Arcoíris', 'primary' => '#F784B0', 'secondary' => '#4BBBE5', 'accent' => '#EBA81F', 'background' => '#FFF9EE', 'text' => '#3F3557'],
        'algodon' => ['label' => 'Algodón de azúcar', 'primary' => '#F4A3C4', 'secondary' => '#A8C4E5', 'accent' => '#F8D57E', 'background' => '#FFF5FA', 'text' => '#45364F'],
        'lavanda' => ['label' => 'Lavanda', 'primary' => '#C9A0D3', 'secondary' => '#A8C4E5', 'accent' => '#F9C866', 'background' => '#F9F5FF', 'text' => '#3E3556'],
        'menta' => ['label' => 'Menta fresca', 'primary' => '#7FCFB0', 'secondary' => '#A8C4E5', 'accent' => '#F4A3C4', 'background' => '#F3FBF7', 'text' => '#2F4A45'],
        'durazno' => ['label' => 'Durazno', 'primary' => '#F7A38B', 'secondary' => '#9BC5E8', 'accent' => '#F7C873', 'background' => '#FFF7F0', 'text' => '#4A3A35'],
        'cielo' => ['label' => 'Cielo', 'primary' => '#7EB8E8', 'secondary' => '#C9A0D3', 'accent' => '#F8D57E', 'background' => '#F4F9FF', 'text' => '#2F3D56'],
    ];

    public const DEFAULT_PRESET = 'arcoiris';

    public const DEFAULT_HEADING_FONT = 'quicksand';

    public const DEFAULT_BODY_FONT = 'nunito';

    /**
     * "Arcoíris" con Quicksand + Nunito.
     *
     * @return array{primary: string, secondary: string, accent: string, background: string, text: string, heading_font: string, body_font: string}
     */
    public static function defaults(): array
    {
        $preset = self::PRESETS[self::DEFAULT_PRESET];

        return [
            'primary' => $preset['primary'],
            'secondary' => $preset['secondary'],
            'accent' => $preset['accent'],
            'background' => $preset['background'],
            'text' => $preset['text'],
            'heading_font' => self::DEFAULT_HEADING_FONT,
            'body_font' => self::DEFAULT_BODY_FONT,
        ];
    }

    /**
     * Opciones para el panel (listas de fuentes y combinaciones pastel).
     *
     * @return array{fonts: list<array{value: string, label: string, style: string, google: string}>, presets: list<array<string, string>>}
     */
    public static function options(): array
    {
        return [
            'fonts' => collect(self::FONTS)->map(fn (array $f, string $key) => [
                'value' => $key, 'label' => $f['label'], 'style' => $f['style'], 'google' => $f['google'],
            ])->values()->all(),
            'presets' => collect(self::PRESETS)->map(fn (array $p, string $key) => ['key' => $key, ...$p])->values()->all(),
        ];
    }

    /**
     * Tema actual con valores por defecto para lo que no se haya configurado.
     *
     * @return array{primary: string, secondary: string, accent: string, background: string, text: string, heading_font: string, body_font: string}
     */
    public static function current(): array
    {
        $defaults = self::defaults();

        $saved = Setting::getValue(self::SETTING_KEY, []);
        $theme = array_merge($defaults, array_intersect_key(is_array($saved) ? $saved : [], $defaults));

        // Si alguien guardó una fuente que ya no existe, regresa a la de default.
        foreach (['heading_font' => self::DEFAULT_HEADING_FONT, 'body_font' => self::DEFAULT_BODY_FONT] as $key => $fallback) {
            if (! isset(self::FONTS[$theme[$key]])) {
                $theme[$key] = $fallback;
            }
        }

        return $theme;
    }

    /**
     * Variables CSS que se inyectan en <head>. Incluye versiones "strong"
     * (más oscuras) de los colores para botones con letra blanca, calculadas
     * para que siempre se lean bien sin importar el pastel que elija Liz.
     *
     * @return array<string, string>
     */
    public static function cssVariables(): array
    {
        $theme = self::current();
        $heading = self::FONTS[$theme['heading_font']];
        $body = self::FONTS[$theme['body_font']];

        return [
            '--brand-primary' => $theme['primary'],
            '--brand-primary-strong' => Color::readableOnWhite($theme['primary']),
            '--brand-primary-soft' => Color::mix($theme['primary'], '#FFFFFF', 0.82),
            '--brand-secondary' => $theme['secondary'],
            '--brand-secondary-strong' => Color::readableOnWhite($theme['secondary']),
            '--brand-secondary-soft' => Color::mix($theme['secondary'], '#FFFFFF', 0.82),
            '--brand-accent' => $theme['accent'],
            '--brand-accent-strong' => Color::readableOnWhite($theme['accent']),
            '--brand-accent-soft' => Color::mix($theme['accent'], '#FFFFFF', 0.8),
            '--brand-background' => $theme['background'],
            '--brand-text' => $theme['text'],
            '--brand-font-heading' => "'{$heading['label']}', {$heading['stack']}",
            '--brand-font-body' => "'{$body['label']}', {$body['stack']}",
        ];
    }

    /**
     * Bloque <style> listo para imprimir en la plantilla Blade.
     */
    public static function styleTag(): string
    {
        $rules = collect(self::cssVariables())
            ->map(fn (string $value, string $name) => $name.': '.$value.';')
            ->implode(' ');

        return '<style id="brand-theme">:root { '.$rules.' }</style>';
    }

    /**
     * URL de Google Fonts con solo las fuentes elegidas.
     */
    public static function googleFontsUrl(): string
    {
        $theme = self::current();

        $families = collect([$theme['heading_font'], $theme['body_font']])
            ->unique()
            ->map(fn (string $font) => 'family='.self::FONTS[$font]['google'])
            ->implode('&');

        return 'https://fonts.googleapis.com/css2?'.$families.'&display=swap';
    }
}
