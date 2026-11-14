<?php

namespace App\Services\Content;

use App\Models\GalleryItem;
use App\Support\ImageUploader;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Galería de actividades ("evidencia de trabajo").
 */
class GalleryService
{
    use ReordersRecords;

    private const FOLDER = 'gallery';

    private const MAX_WIDTH = 1400;

    public function __construct(private ImageUploader $images) {}

    /**
     * Sube varias fotos de una vez. Las nuevas aparecen primero.
     *
     * @param  list<UploadedFile>  $files
     * @return Collection<int, GalleryItem>
     */
    public function createMany(array $files, ?string $caption = null): Collection
    {
        // Primero se guardan las fotos; si algo falla en la base, se borran
        // para no dejar archivos huérfanos ocupando espacio en el hosting.
        $paths = collect($files)->values()->map(fn (UploadedFile $file) => $this->images->store($file, self::FOLDER, self::MAX_WIDTH));

        try {
            return DB::transaction(function () use ($paths, $caption): Collection {
                // Recorre las fotos existentes para que las nuevas queden primero
                // (sort_order no acepta negativos en MySQL).
                GalleryItem::query()->increment('sort_order', $paths->count());

                return $paths->map(fn (string $path, int $i) => GalleryItem::create([
                    'image_path' => $path,
                    'caption' => $caption,
                    'sort_order' => $i,
                    'is_active' => true,
                ]));
            });
        } catch (Throwable $e) {
            $paths->each(fn (string $path) => $this->images->delete($path));

            throw $e;
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(GalleryItem $item, array $data, ?UploadedFile $image = null): GalleryItem
    {
        unset($data['image']);

        if ($image) {
            $data['image_path'] = $this->images->replace($item->image_path, $image, self::FOLDER, self::MAX_WIDTH);
        }

        $item->update($data);

        return $item;
    }

    public function toggle(GalleryItem $item): GalleryItem
    {
        $item->update(['is_active' => ! $item->is_active]);

        return $item;
    }

    public function delete(GalleryItem $item): void
    {
        $this->images->delete($item->image_path);
        $item->delete();
    }

    /**
     * @param  list<int>  $ids
     */
    public function reorder(array $ids): void
    {
        $this->applyOrder(GalleryItem::class, $ids);
    }
}
