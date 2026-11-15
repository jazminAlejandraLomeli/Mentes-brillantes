<?php

namespace App\Support;

use Illuminate\Support\Arr;

/**
 * Lee config/site.json: datos del negocio, WhatsApp y redes sociales.
 *
 * El archivo se puede editar directamente en el servidor (por ejemplo desde
 * el Administrador de archivos de Hostinger) y el cambio se ve al instante,
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
            $path = base_path('config/site.json');
            $decoded = is_file($path) ? json_decode((string) file_get_contents($path), true) : null;
            $site = is_array($decoded) ? $decoded : [];

            // Los grupos de datos se completan campo por campo con los valores por defecto;
            // las listas (categorías, puntos destacados…) se toman completas del cliente.
            $merged = self::DEFAULTS;
            foreach ($site as $key => $value) {
                $merged[$key] = is_array($value) && ! array_is_list($value) && is_array($merged[$key] ?? null)
                    ? array_replace($merged[$key], $value)
                    : $value;
            }

            self::$data = $merged;
        }

        return self::$data;
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
        self::$data = null;
        $merged = self::DEFAULTS;
        foreach ($site as $key => $value) {
            $merged[$key] = is_array($value) && ! array_is_list($value) && is_array($merged[$key] ?? null)
                ? array_replace($merged[$key], $value)
                : $value;
        }
        self::$data = $merged;
    }
}
