<?php

namespace App\Http\Resources;

use App\Models\AppointmentSeries;
use App\Support\WhatsAppLink;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/** @mixin AppointmentSeries */
class AppointmentSeriesResource extends JsonResource
{
    private const DAY_NAMES = [1 => 'lunes', 2 => 'martes', 3 => 'miércoles', 4 => 'jueves', 5 => 'viernes', 6 => 'sábado', 7 => 'domingo'];

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $days = collect($this->weekdays)->sort()->map(fn ($d) => self::DAY_NAMES[(int) $d] ?? '')->values();
        $time = substr($this->start_time, 0, 5);

        return [
            'id' => $this->id,
            'student_id' => $this->student_id,
            'service_id' => $this->service_id,
            'subject' => $this->subject,
            'weekdays' => $this->weekdays,
            'start_time' => $time,
            'duration_minutes' => $this->duration_minutes,
            'starts_on' => $this->starts_on->toDateString(),
            'sessions_count' => $this->sessions_count,
            'ends_on' => $this->ends_on?->toDateString(),
            'notes' => $this->notes,
            // "lunes y miércoles a las 5:00 pm"
            'summary' => $days->count() > 1
                ? $days->slice(0, -1)->implode(', ').' y '.$days->last().' a las '.WhatsAppLink::formatTime(Carbon::createFromFormat('H:i', $time))
                : $days->first().' a las '.WhatsAppLink::formatTime(Carbon::createFromFormat('H:i', $time)),
            'appointments_count' => $this->whenCounted('appointments'),
            'remaining_count' => $this->whenCounted('remainingAppointments'),
        ];
    }
}
