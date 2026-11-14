<?php

namespace App\Support;

/**
 * Utilidades de color para el tema (hex ↔ rgb, contraste y mezclas).
 */
class Color
{
    /**
     * @return array{0: int, 1: int, 2: int}
     */
    public static function toRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        return [
            (int) hexdec(substr($hex, 0, 2)),
            (int) hexdec(substr($hex, 2, 2)),
            (int) hexdec(substr($hex, 4, 2)),
        ];
    }

    /**
     * @param  array{0: int|float, 1: int|float, 2: int|float}  $rgb
     */
    public static function toHex(array $rgb): string
    {
        return '#'.implode('', array_map(
            fn ($c) => str_pad(dechex((int) round(max(0, min(255, $c)))), 2, '0', STR_PAD_LEFT),
            $rgb,
        ));
    }

    /**
     * Mezcla dos colores. $amount = 0 → solo $a, 1 → solo $b.
     */
    public static function mix(string $a, string $b, float $amount): string
    {
        [$r1, $g1, $b1] = self::toRgb($a);
        [$r2, $g2, $b2] = self::toRgb($b);

        return strtoupper(self::toHex([
            $r1 + ($r2 - $r1) * $amount,
            $g1 + ($g2 - $g1) * $amount,
            $b1 + ($b2 - $b1) * $amount,
        ]));
    }

    public static function luminance(string $hex): float
    {
        $channels = array_map(function (int $c): float {
            $c /= 255;

            return $c <= 0.03928 ? $c / 12.92 : (($c + 0.055) / 1.055) ** 2.4;
        }, self::toRgb($hex));

        return 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];
    }

    public static function contrast(string $a, string $b): float
    {
        $l1 = self::luminance($a);
        $l2 = self::luminance($b);

        return (max($l1, $l2) + 0.05) / (min($l1, $l2) + 0.05);
    }

    /**
     * Oscurece el color lo justo para que el texto blanco encima se lea bien
     * (contraste 4.5:1, el mínimo recomendado de accesibilidad).
     */
    public static function readableOnWhite(string $hex, float $minContrast = 4.5): string
    {
        $color = strtoupper($hex);

        for ($step = 0; $step < 20 && self::contrast($color, '#FFFFFF') < $minContrast; $step++) {
            $color = self::mix($color, '#000000', 0.06);
        }

        return $color;
    }
}
