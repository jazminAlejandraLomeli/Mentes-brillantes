<?php

namespace App\Support;

/**
 * Tipos de servicio ("Regularización", "Taller"…), definidos por cliente
 * en config/site.json → "categories". Cada uno tiene:
 *   key   → lo que se guarda en la base (no lo cambies si ya hay servicios con él)
 *   label → lo que se ve en la página
 *   color → primary | secondary | accent (color de la etiqueta)
 */
class ServiceCategories
{
    private const COLORS = ['primary', 'secondary', 'accent'];

    /**
     * @return list<array{value: string, label: string, color: string}>
     */
    public static function options(): array
    {
        $categories = SiteConfig::get('categories');
        $categories = is_array($categories) && $categories !== [] ? $categories : SiteConfig::DEFAULTS['categories'];

        return array_values(array_map(fn (array $c) => [
            'value' => (string) $c['key'],
            'label' => (string) ($c['label'] ?? $c['key']),
            'color' => in_array($c['color'] ?? null, self::COLORS, true) ? $c['color'] : 'secondary',
        ], array_filter($categories, fn ($c) => is_array($c) && filled($c['key'] ?? null))));
    }

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_column(self::options(), 'value');
    }

    public static function label(string $key): string
    {
        return collect(self::options())->firstWhere('value', $key)['label'] ?? $key;
    }

    public static function color(string $key): string
    {
        return collect(self::options())->firstWhere('value', $key)['color'] ?? 'secondary';
    }

    public static function first(): string
    {
        return self::keys()[0] ?? 'general';
    }
}
