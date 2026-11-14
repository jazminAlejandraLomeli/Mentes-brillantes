<?php

namespace App\Services\Content;

use App\Models\Service;
use App\Support\ImageUploader;
use Illuminate\Http\UploadedFile;

/**
 * Catálogo de servicios y cursos (regularización, talleres, verano).
 */
class ServiceCatalogService
{
    use ReordersRecords;

    private const FOLDER = 'services';

    private const MAX_WIDTH = 1200;

    public function __construct(private ImageUploader $images) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $image = null): Service
    {
        return Service::create([
            ...$this->clean($data),
            'image_path' => $image ? $this->images->store($image, self::FOLDER, self::MAX_WIDTH) : null,
            'sort_order' => (int) Service::max('sort_order') + 1,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Service $service, array $data, ?UploadedFile $image = null, bool $removeImage = false): Service
    {
        $data = $this->clean($data);

        if ($image) {
            $data['image_path'] = $this->images->replace($service->image_path, $image, self::FOLDER, self::MAX_WIDTH);
        } elseif ($removeImage) {
            $this->images->delete($service->image_path);
            $data['image_path'] = null;
        }

        // Si cambió el título, actualiza también el slug
        if (isset($data['title']) && $data['title'] !== $service->title) {
            $data['slug'] = Service::uniqueSlug($data['title'], $service->id);
        }

        $service->update($data);

        return $service;
    }

    public function toggle(Service $service): Service
    {
        $service->update(['is_active' => ! $service->is_active]);

        return $service;
    }

    public function delete(Service $service): void
    {
        $this->images->delete($service->image_path);
        $service->delete();
    }

    /**
     * @param  list<int>  $ids
     */
    public function reorder(array $ids): void
    {
        $this->applyOrder(Service::class, $ids);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function clean(array $data): array
    {
        unset($data['image'], $data['remove_image']);

        return $data;
    }
}
