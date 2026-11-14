<?php

namespace App\Services\Content;

use App\Models\Banner;
use App\Support\ImageUploader;
use Illuminate\Http\UploadedFile;

class BannerService
{
    use ReordersRecords;

    private const FOLDER = 'banners';

    private const MAX_WIDTH = 1920;

    public function __construct(private ImageUploader $images) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, UploadedFile $image): Banner
    {
        return Banner::create([
            ...$data,
            'image_path' => $this->images->store($image, self::FOLDER, self::MAX_WIDTH),
            'sort_order' => (int) Banner::max('sort_order') + 1,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Banner $banner, array $data, ?UploadedFile $image = null): Banner
    {
        if ($image) {
            $data['image_path'] = $this->images->replace($banner->image_path, $image, self::FOLDER, self::MAX_WIDTH);
        }

        $banner->update($data);

        return $banner;
    }

    public function toggle(Banner $banner): Banner
    {
        $banner->update(['is_active' => ! $banner->is_active]);

        return $banner;
    }

    public function delete(Banner $banner): void
    {
        $this->images->delete($banner->image_path);
        $banner->delete();
    }

    /**
     * @param  list<int>  $ids
     */
    public function reorder(array $ids): void
    {
        $this->applyOrder(Banner::class, $ids);
    }
}
