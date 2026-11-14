<?php

namespace App\Http\Resources;

use App\Models\Service;
use App\Support\WhatsAppLink;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Service */
class ServiceResource extends JsonResource
{
    /** En la página pública se ocultan precio y datos internos si Liz así lo eligió. */
    private bool $public = false;

    public function forPublic(): static
    {
        $this->public = true;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $showPrice = $this->show_price && $this->price !== null;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'category' => $this->category->value,
            'category_label' => $this->category->label(),
            'short_description' => $this->short_description,
            'description' => $this->description,
            'age_min' => $this->age_min,
            'age_max' => $this->age_max,
            'age_range' => $this->ageRangeLabel(),
            'modality' => $this->modality->value,
            'modality_label' => $this->modality->label(),
            'price' => $this->public && ! $showPrice ? null : $this->price,
            'price_note' => $this->public && ! $showPrice ? null : $this->price_note,
            'show_price' => $this->show_price,
            'image_url' => $this->image_url,
            'is_featured' => $this->is_featured,
            'is_active' => $this->when(! $this->public, $this->is_active),
            'sort_order' => $this->when(! $this->public, $this->sort_order),
            'whatsapp_url' => $this->when($this->public, fn () => WhatsAppLink::contact($this->resource)),
        ];
    }
}
