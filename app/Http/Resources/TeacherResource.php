<?php

namespace App\Http\Resources;

use App\Models\Teacher;
use App\Support\PhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Teacher */
class TeacherResource extends JsonResource
{
    /** En la página pública no se manda el teléfono ni datos internos */
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
        $profile = [
            'id' => $this->id,
            'name' => $this->name,
            'full_name' => $this->full_name,
            'title' => $this->title,
            'photo_url' => $this->photoUrl(),
            'bio' => $this->bio,
            'education' => $this->education,
            'education_list' => $this->educationList(),
            'specialties' => $this->specialties ?? [],
            'color' => $this->color,
        ];

        if ($this->public) {
            return $profile;
        }

        return [
            ...$profile,
            'whatsapp_phone' => $this->whatsapp_phone,
            'whatsapp_phone_formatted' => $this->whatsapp_phone ? PhoneNumber::format($this->whatsapp_phone) : null,
            'is_active' => $this->is_active,
            'show_on_website' => $this->show_on_website,
            'upcoming_count' => $this->whenCounted('upcomingAppointments'),
        ];
    }
}
