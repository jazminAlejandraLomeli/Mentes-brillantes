<?php

namespace App\Http\Resources;

use App\Models\Event;
use App\Support\WhatsAppLink;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/** @mixin Event */
class EventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $time = $this->event_time ? substr($this->event_time, 0, 5) : null;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'body' => $this->body,
            'event_date' => $this->event_date?->toDateString(),
            'event_time' => $time,
            'date_label' => $this->event_date?->copy()->locale('es')->isoFormat('dddd D [de] MMMM'),
            'time_label' => $time ? WhatsAppLink::formatTime(Carbon::createFromFormat('H:i', $time)) : null,
            'is_past' => $this->event_date?->isBefore(today()) ?? false,
            'location' => $this->location,
            'image_url' => $this->image_url,
            'is_published' => $this->is_published,
        ];
    }
}
