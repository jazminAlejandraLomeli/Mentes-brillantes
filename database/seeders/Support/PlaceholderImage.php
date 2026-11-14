<?php

namespace Database\Seeders\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Genera imágenes de ejemplo (SVG pastel) para los datos de prueba,
 * para que la página no se vea vacía mientras Liz sube sus fotos reales.
 */
class PlaceholderImage
{
    /** @var list<array{0: string, 1: string}> */
    private const GRADIENTS = [
        ['#FDE6EF', '#F784B0'],
        ['#E0F3FA', '#4BBBE5'],
        ['#FBEED2', '#EBA81F'],
        ['#E9F7E1', '#87D068'],
        ['#F3E9F6', '#C9A0D3'],
        ['#E6EEF8', '#A8C4E5'],
    ];

    /**
     * Guarda el SVG en el disco "public" y regresa su ruta (para image_path).
     */
    public static function make(string $folder, string $label, int $index, int $width = 1200, int $height = 800): string
    {
        // Sin texto: el título real lo pone la página encima de la imagen.
        [$from, $to] = self::GRADIENTS[$index % count(self::GRADIENTS)];
        $unit = (int) round(min($width, $height) / 10);
        $cx = (int) ($width * 0.72);
        $cy = (int) ($height * 0.62);
        $arcs = '';

        foreach (['#F784B0', '#EBA81F', '#4BBBE5', '#87D068'] as $i => $color) {
            $r = $unit * (4 - $i);
            $arcs .= '<path d="M '.($cx - $r)." {$cy} A {$r} {$r} 0 0 1 ".($cx + $r)." {$cy}\" fill=\"none\" stroke=\"{$color}\" stroke-width=\"".(int) ($unit * 0.7).'" stroke-linecap="round" opacity="0.55"/>';
        }

        $svg = <<<SVG
        <svg xmlns="http://www.w3.org/2000/svg" width="{$width}" height="{$height}" viewBox="0 0 {$width} {$height}">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="{$from}"/>
              <stop offset="1" stop-color="{$to}"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
          <circle cx="{$unit}" cy="{$unit}" r="{$unit}" fill="#FFFFFF" opacity="0.35"/>
          <circle cx="{$width}" cy="{$height}" r="{$unit}" fill="#FFFFFF" opacity="0.3"/>
          {$arcs}
        </svg>
        SVG;

        $path = $folder.'/ejemplo-'.Str::slug($label).'-'.$index.'.svg';
        Storage::disk('public')->put($path, $svg);

        return $path;
    }
}
