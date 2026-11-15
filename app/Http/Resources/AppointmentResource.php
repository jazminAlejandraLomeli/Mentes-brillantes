<?php

namespace App\Http\Resources;

use App\Models\Appointment;
use App\Support\WhatsAppLink;
use App\Support\WhatsAppTemplates;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Appointment */
class AppointmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $startsAt = $this->starts_at;
        $endsAt = $this->endsAt();
        $canMessage = $this->relationLoaded('student') && $this->student->relationLoaded('guardian');

        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'service_id' => $this->service_id,
            'teacher_id' => $this->teacher_id,
            'appointment_series_id' => $this->appointment_series_id,
            'subject' => $this->subject,
            'topic' => $this->topic(),
            'starts_at' => $startsAt->toIso8601String(),
            'ends_at' => $endsAt->toIso8601String(),
            'date' => $startsAt->toDateString(),
            'time' => $startsAt->format('H:i'),
            'date_label' => WhatsAppLink::formatDate($startsAt),
            'time_label' => WhatsAppLink::formatTime($startsAt).' – '.WhatsAppLink::formatTime($endsAt),
            'duration_minutes' => $this->duration_minutes,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->color(),
            'is_past' => $endsAt->isPast(),
            'notes' => $this->notes,
            'reminder_sent_at' => $this->reminder_sent_at?->toIso8601String(),
            'student' => new StudentResource($this->whenLoaded('student')),
            'teacher' => $this->whenLoaded('teacher', fn () => $this->teacher ? [
                'id' => $this->teacher->id,
                'name' => $this->teacher->name,
                'color' => $this->teacher->color,
            ] : null),
            'service' => $this->whenLoaded('service', fn () => $this->service ? [
                'id' => $this->service->id,
                'title' => $this->service->title,
            ] : null),
            // Enlaces de WhatsApp listos para abrir (con el mensaje ya escrito)
            'whatsapp' => $this->when($canMessage, fn () => [
                'reminder' => WhatsAppLink::forAppointment($this->resource, WhatsAppTemplates::REMINDER),
                'cancellation' => WhatsAppLink::forAppointment($this->resource, WhatsAppTemplates::CANCELLATION),
                'reschedule' => WhatsAppLink::forAppointment($this->resource, WhatsAppTemplates::RESCHEDULE),
            ]),
        ];
    }
}
