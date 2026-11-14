<?php

namespace App\Support;

class PhoneNumber
{
    /**
     * Deja un celular de México en 10 dígitos, o null si no es válido.
     * Acepta cómo lo escriba la gente:
     *
     *   "378 122 0818"        → "3781220818"
     *   "+52 (378) 122-0818"  → "3781220818"
     *   "+52 1 378 122 0818"  → "3781220818"  (formato viejo con 1)
     *   "12345"               → null
     */
    public static function normalize(?string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone) ?? '';

        if (strlen($digits) === 13 && str_starts_with($digits, '521')) {
            $digits = substr($digits, 3);
        } elseif (strlen($digits) === 12 && str_starts_with($digits, '52')) {
            $digits = substr($digits, 2);
        }

        return strlen($digits) === 10 ? $digits : null;
    }

    /**
     * Para mostrar: "3781220818" → "378 122 0818".
     */
    public static function format(?string $phone): string
    {
        $digits = self::normalize($phone);

        return $digits === null
            ? (string) $phone
            : substr($digits, 0, 3).' '.substr($digits, 3, 3).' '.substr($digits, 6);
    }

    /**
     * Para wa.me: solo dígitos y con lada de país (52 + 10 dígitos).
     */
    public static function forWhatsApp(string $phone): string
    {
        $normalized = self::normalize($phone);

        return $normalized !== null ? '52'.$normalized : (preg_replace('/\D+/', '', $phone) ?? '');
    }
}
