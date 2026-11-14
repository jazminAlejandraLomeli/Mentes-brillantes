<?php

namespace App\Http\Resources;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Student */
class StudentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'school_grade' => $this->school_grade->value,
            'school_grade_label' => $this->school_grade->label(),
            'school_name' => $this->school_name,
            'birth_date' => $this->birth_date?->toDateString(),
            'age' => $this->age(),
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'guardian_id' => $this->guardian_id,
            'guardian' => new GuardianResource($this->whenLoaded('guardian')),
            'upcoming_appointments_count' => $this->whenCounted('upcomingAppointments'),
            'next_appointment' => new AppointmentResource($this->whenLoaded('nextAppointment')),
        ];
    }
}
