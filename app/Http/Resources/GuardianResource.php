<?php

namespace App\Http\Resources;

use App\Models\Guardian;
use App\Support\PhoneNumber;
use App\Support\WhatsAppLink;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Guardian */
class GuardianResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'whatsapp_phone' => $this->whatsapp_phone,
            'whatsapp_phone_formatted' => PhoneNumber::format($this->whatsapp_phone),
            'whatsapp_url' => WhatsAppLink::to($this->whatsapp_phone),
            'email' => $this->email,
            'notes' => $this->notes,
            'students' => StudentResource::collection($this->whenLoaded('students')),
            'students_count' => $this->whenCounted('students'),
        ];
    }
}
