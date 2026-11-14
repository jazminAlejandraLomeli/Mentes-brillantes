<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\AppointmentSeries;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Agenda: agendar, mover, cambiar estado y marcar recordatorios.
 */
class AppointmentService
{
    /**
     * @param  array<string, mixed>  $data  (starts_at ya como Carbon)
     */
    public function schedule(array $data): Appointment
    {
        return Appointment::create([
            'status' => AppointmentStatus::Pending,
            ...$data,
        ]);
    }

    /**
     * Si cambia la fecha u hora, la cita vuelve a "pendiente" y se limpia el
     * recordatorio (hay que avisar a la familia del nuevo horario).
     *
     * @param  array<string, mixed>  $data
     * @return bool ¿Se movió de fecha/hora?
     */
    public function update(Appointment $appointment, array $data): bool
    {
        $newStart = $data['starts_at'] ?? $appointment->starts_at;
        $moved = ! $appointment->starts_at->equalTo($newStart);

        if ($moved) {
            $data['reminder_sent_at'] = null;
            $data['status'] ??= AppointmentStatus::Pending;
        }

        $appointment->update($data);

        return $moved;
    }

    public function changeStatus(Appointment $appointment, AppointmentStatus $status): Appointment
    {
        $appointment->update(['status' => $status]);

        return $appointment;
    }

    public function markReminderSent(Appointment $appointment): Appointment
    {
        $appointment->update(['reminder_sent_at' => now()]);

        return $appointment;
    }

    public function delete(Appointment $appointment): void
    {
        $appointment->delete();
    }

    /**
     * Cancela las clases que faltan de una serie (las pasadas se conservan).
     *
     * @return int Cuántas clases se cancelaron
     */
    public function cancelRemaining(AppointmentSeries $series): int
    {
        return $series->remainingAppointments()->update(['status' => AppointmentStatus::Cancelled]);
    }

    /**
     * Borra la serie y sus clases futuras. Las que ya pasaron se quedan en el
     * historial del alumno (como clases sueltas).
     */
    public function deleteSeries(AppointmentSeries $series): void
    {
        $series->appointments()->where('starts_at', '>=', now())->delete();
        $series->delete();
    }

    /**
     * Otras clases activas que se enciman con este horario (solo para avisar,
     * no bloquea: Liz puede dar clases a varios niños a la vez).
     *
     * @return Collection<int, Appointment>
     */
    public function conflicts(Carbon $startsAt, int $durationMinutes, ?int $ignoreId = null): Collection
    {
        $endsAt = $startsAt->copy()->addMinutes($durationMinutes);

        return Appointment::query()
            ->with('student')
            ->active()
            ->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))
            ->whereBetween('starts_at', [$startsAt->copy()->subHours(8), $endsAt])
            ->get()
            ->filter(fn (Appointment $a) => $a->starts_at->lt($endsAt) && $a->endsAt()->gt($startsAt))
            ->values();
    }
}
