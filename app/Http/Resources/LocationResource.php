<?php

namespace App\Http\Resources;

use App\Models\Location;
use App\Support\PhoneNumber;
use App\Support\WhatsAppLink;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Location */
class LocationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'landmark' => $this->landmark,
            'schedule' => $this->schedule,
            'schedule_list' => $this->scheduleList(),
            'whatsapp_phone' => $this->whatsapp_phone,
            'whatsapp_phone_formatted' => $this->whatsapp_phone ? PhoneNumber::format($this->whatsapp_phone) : null,
            // Si la sucursal no tiene WhatsApp propio, se usa el general del negocio
            'whatsapp_url' => $this->whatsapp_phone ? WhatsAppLink::to($this->whatsapp_phone) : null,
            'maps_url' => $this->maps_url,
            'directions_url' => $this->directionsUrl(),
            'map_embed_url' => $this->mapEmbedUrl(),
            'is_active' => $this->is_active,
        ];
    }
}
