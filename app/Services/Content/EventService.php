<?php

namespace App\Services\Content;

use App\Models\Event;
use App\Support\ImageUploader;
use Illuminate\Http\UploadedFile;

/**
 * Próximos eventos y avisos.
 */
class EventService
{
    private const FOLDER = 'events';

    private const MAX_WIDTH = 1200;

    public function __construct(private ImageUploader $images) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $image = null): Event
    {
        return Event::create([
            ...$this->clean($data),
            'image_path' => $image ? $this->images->store($image, self::FOLDER, self::MAX_WIDTH) : null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Event $event, array $data, ?UploadedFile $image = null, bool $removeImage = false): Event
    {
        $data = $this->clean($data);

        if ($image) {
            $data['image_path'] = $this->images->replace($event->image_path, $image, self::FOLDER, self::MAX_WIDTH);
        } elseif ($removeImage) {
            $this->images->delete($event->image_path);
            $data['image_path'] = null;
        }

        if (isset($data['title']) && $data['title'] !== $event->title) {
            $data['slug'] = Event::uniqueSlug($data['title'], $event->id);
        }

        $event->update($data);

        return $event;
    }

    public function toggle(Event $event): Event
    {
        $event->update(['is_published' => ! $event->is_published]);

        return $event;
    }

    public function delete(Event $event): void
    {
        $this->images->delete($event->image_path);
        $event->delete();
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
