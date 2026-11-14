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

            self::$data = is_array($decoded) ? $decoded : [];
        }

        return self::$data;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return Arr::get(self::all(), $key, $default);
    }

    /**
     * Número de WhatsApp de Liz listo para wa.me (solo dígitos).
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
}
