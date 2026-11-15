<?php

namespace App\Support;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Guarda imágenes en el disco "public" ya optimizadas:
 * - las endereza (las fotos de celular a veces vienen giradas),
 * - las reduce si son más anchas de lo necesario,
 * - las convierte a WebP (pesan mucho menos y se ven igual).
 *
 * Si el servidor no tiene GD, guarda el archivo original tal cual.
 */
class ImageUploader
{
    public const DISK = 'public';

    public function __construct(private int $quality = 82) {}

    /**
     * @return string Ruta relativa para guardar en `image_path`
     */
    public function store(UploadedFile $file, string $folder, int $maxWidth = 1600): string
    {
        $image = $this->load($file);

        if ($image === null) {
            return $file->store($folder, self::DISK);
        }

        $image = $this->fixOrientation($image, $file);
        $image = $this->scaleDown($image, $maxWidth);

        ob_start();
        imagewebp($image, null, $this->quality);
        $contents = (string) ob_get_clean();

        $path = trim($folder, '/').'/'.Str::uuid().'.webp';
        Storage::disk(self::DISK)->put($path, $contents);

        return $path;
    }

    /**
     * Icono cuadrado en PNG (para la pestaña del navegador / celular):
     * la imagen se acomoda centrada, sin recortarse, con fondo transparente.
     *
     * @return string|null Ruta guardada, o null si el servidor no tiene GD
     */
    public function storeSquareIcon(UploadedFile $file, string $folder, int $size): ?string
    {
        $image = $this->load($file);

        if ($image === null) {
            return null;
        }

        $image = $this->fixOrientation($image, $file);
        [$width, $height] = [imagesx($image), imagesy($image)];
        $scale = min($size / $width, $size / $height);
        [$w, $h] = [max(1, (int) round($width * $scale)), max(1, (int) round($height * $scale))];

        $canvas = imagecreatetruecolor($size, $size);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefill($canvas, 0, 0, (int) imagecolorallocatealpha($canvas, 0, 0, 0, 127));
        imagecopyresampled($canvas, $image, (int) (($size - $w) / 2), (int) (($size - $h) / 2), 0, 0, $w, $h, $width, $height);

        ob_start();
        imagepng($canvas);
        $contents = (string) ob_get_clean();

        $path = trim($folder, '/').'/icon-'.$size.'-'.Str::random(8).'.png';
        Storage::disk(self::DISK)->put($path, $contents);

        return $path;
    }

    /**
     * Sube la nueva imagen y borra la anterior.
     */
    public function replace(?string $oldPath, UploadedFile $file, string $folder, int $maxWidth = 1600): string
    {
        $path = $this->store($file, $folder, $maxWidth);
        $this->delete($oldPath);

        return $path;
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk(self::DISK)->exists($path)) {
            Storage::disk(self::DISK)->delete($path);
        }
    }

    private function load(UploadedFile $file): ?GdImage
    {
        if (! extension_loaded('gd')) {
            return null;
        }

        $loader = match ($file->getMimeType()) {
            'image/jpeg' => 'imagecreatefromjpeg',
            'image/png' => 'imagecreatefrompng',
            'image/webp' => 'imagecreatefromwebp',
            default => null,
        };

        if ($loader === null || ! function_exists($loader)) {
            return null;
        }

        $image = @$loader($file->getRealPath());

        if (! $image instanceof GdImage) {
            return null;
        }

        // Conserva la transparencia de PNG/WebP
        imagepalettetotruecolor($image);
        imagealphablending($image, true);
        imagesavealpha($image, true);

        return $image;
    }

    private function fixOrientation(GdImage $image, UploadedFile $file): GdImage
    {
        if ($file->getMimeType() !== 'image/jpeg' || ! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($file->getRealPath());
        $angle = match ((int) ($exif['Orientation'] ?? 1)) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        if ($angle === 0) {
            return $image;
        }

        $rotated = imagerotate($image, $angle, 0);

        return $rotated instanceof GdImage ? $rotated : $image;
    }

    private function scaleDown(GdImage $image, int $maxWidth): GdImage
    {
        if (imagesx($image) <= $maxWidth) {
            return $image;
        }

        // imagecopyresampled funciona igual en cualquier versión de GD
        // (imagescale con IMG_BICUBIC falla en algunos servidores).
        $height = (int) round(imagesy($image) * $maxWidth / imagesx($image));
        $scaled = imagecreatetruecolor($maxWidth, $height);

        if (! $scaled instanceof GdImage) {
            return $image;
        }

        imagealphablending($scaled, false);
        imagesavealpha($scaled, true);
        imagecopyresampled($scaled, $image, 0, 0, 0, 0, $maxWidth, $height, imagesx($image), imagesy($image));

        return $scaled;
    }
}
