<?php

namespace App\Support;

use Illuminate\Support\Arr;

/**
 * Lee config/site.json: datos del negocio, WhatsApp y redes sociales.
 *
 * Si en el servidor existe config/site.local.json (no se sube a GitHub),
 * sus datos reemplazan a los de site.json. Así la demo y el sitio de cada
 * cliente comparten el mismo código pero cada uno tiene, por ejemplo,
 * su propio número de WhatsApp. Basta con poner ahí solo lo que cambia:
 *
 *     { "whatsapp": { "phone": "3781234567" } }
 *
 * Los archivos se pueden editar en el servidor y el cambio se ve al instante,
 * sin recompilar el frontend ni limpiar la caché de configuración.
 */
class SiteConfig
{
    /** @var array<string, mixed>|null */
    private static ?array $data = null;

    /**
     * @return array<string, mixed>
     */
    public static function all(): array
    {
        if (self::$data === null) {
            $site = self::merge(self::DEFAULTS, self::read(base_path('config/site.json')));
            self::$data = self::merge($site, self::read(base_path('config/site.local.json')));
        }

        return self::$data;
    }

    /**
     * @return array<string, mixed>
     */
    private static function read(string $path): array
    {
        $decoded = is_file($path) ? json_decode((string) file_get_contents($path), true) : null;

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Los grupos de datos se completan campo por campo;
     * las listas (categorías, puntos destacados…) se reemplazan completas.
     *
     * @param  array<string, mixed>  $base
     * @param  array<string, mixed>  $override
     * @return array<string, mixed>
     */
    private static function merge(array $base, array $override): array
    {
        foreach ($override as $key => $value) {
            $base[$key] = is_array($value) && ! array_is_list($value) && is_array($base[$key] ?? null)
                ? array_replace($base[$key], $value)
                : $value;
        }

        return $base;
    }

    /**
     * Valores por defecto si a config/site.json le falta algo
     * (así un cliente nuevo nunca ve la página rota).
     */
    public const DEFAULTS = [
        'business' => [
            'name' => 'Mi escuela',
            'full_name' => '',
            'owner' => 'Admin',
            'tagline' => 'Clases particulares',
            'teacher' => '',
            'signature' => '',
        ],
        'whatsapp' => ['phone' => '', 'default_message' => '¡Hola! Me gustaría pedir informes 🌟'],
        'social' => ['instagram' => '', 'facebook' => '', 'tiktok' => ''],
        // Funciones que se encienden por cliente
        'features' => ['multi_teacher' => false],
        'categories' => [
            ['key' => 'regularization', 'label' => 'Regularización', 'color' => 'secondary'],
            ['key' => 'workshop', 'label' => 'Taller', 'color' => 'accent'],
            ['key' => 'summer_course', 'label' => 'Curso de verano', 'color' => 'primary'],
        ],
        'highlights' => [],
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        return Arr::get(self::all(), $key, $default);
    }

    /**
     * ¿El salón tiene varios maestros? (agenda con maestro, colores y filtro)
     */
    public static function multiTeacher(): bool
    {
        return (bool) self::get('features.multi_teacher', false);
    }

    /** Nombre corto del negocio: "Mentes Brillantes" */
    public static function name(): string
    {
        return (string) self::get('business.name');
    }

    /** Nombre completo para títulos y redes: "Mentes Brillantes by Liz" */
    public static function fullName(): string
    {
        return (string) (self::get('business.full_name') ?: self::name());
    }

    /** Primer nombre de quien usa el panel: "Liz" */
    public static function owner(): string
    {
        return (string) self::get('business.owner');
    }

    /** Firma de los mensajes de WhatsApp: "Liz de Mentes Brillantes" */
    public static function signature(): string
    {
        return (string) (self::get('business.signature') ?: self::owner().' de '.self::name());
    }

    /**
     * Número de WhatsApp del negocio listo para el enlace (solo dígitos).
     */
    public static function whatsappPhone(): string
    {
        return PhoneNumber::forWhatsApp((string) self::get('whatsapp.phone', ''));
    }

    /**
     * Para pruebas: obliga a releer el archivo.
     */
    public static function flush(): void
    {
        self::$data = null;
    }

    /**
     * Para pruebas: simula el site.json de otro cliente (se completa con los valores por defecto).
     *
     * @param  array<string, mixed>  $site
     */
    public static function fake(array $site): void
    {
        self::$data = self::merge(self::DEFAULTS, $site);
    }
}
