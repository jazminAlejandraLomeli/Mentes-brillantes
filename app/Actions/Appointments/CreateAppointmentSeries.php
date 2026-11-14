<?php

namespace App\Actions\Appointments;

use App\Enums\AppointmentStatus;
use App\Models\AppointmentSeries;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Crea una clase recurrente y todas sus citas de una vez.
 *
 * Ejemplo: Sofía, matemáticas, lunes y miércoles a las 17:00, 10 sesiones
 * desde el 17 de noviembre → 1 serie + 10 citas en la agenda.
 */
class CreateAppointmentSeries
{
    /** Tope de seguridad para no generar miles de citas por error. */
    public const MAX_SESSIONS = 120;

    /**
     * @param  array{
     *     student_id: int,
     *     service_id?: int|null,
     *     subject?: string|null,
     *     weekdays: list<int>,
     *     start_time: string,
     *     duration_minutes?: int,
     *     starts_on: string|Carbon,
     *     sessions_count?: int|null,
     *     ends_on?: string|Carbon|null,
     *     notes?: string|null,
     * }  $data
     */
    public function handle(array $data): AppointmentSeries
    {
        return DB::transaction(function () use ($data): AppointmentSeries {
            $series = AppointmentSeries::create($data);

            $rows = $this->occurrences($series)->map(fn (Carbon $startsAt) => [
                'student_id' => $series->student_id,
                'service_id' => $series->service_id,
                'subject' => $series->subject,
                'starts_at' => $startsAt,
                'duration_minutes' => $series->duration_minutes,
                'status' => AppointmentStatus::Pending,
            ]);

            $series->appointments()->createMany($rows->all());

            return $series->load('appointments');
        });
    }

    /**
     * Fechas y horas de cada sesión de la serie.
     *
     * @return Collection<int, Carbon>
     */
    public function occurrences(AppointmentSeries $series): Collection
    {
        $weekdays = collect($series->weekdays)->map(fn ($d) => (int) $d)->filter(fn ($d) => $d >= 1 && $d <= 7)->unique();

        if ($weekdays->isEmpty()) {
            throw new InvalidArgumentException('Elige al menos un día de la semana.');
        }

        if (! $series->sessions_count && ! $series->ends_on) {
            throw new InvalidArgumentException('Indica cuántas clases son o hasta qué fecha.');
        }

        $limit = min($series->sessions_count ?: self::MAX_SESSIONS, self::MAX_SESSIONS);
        [$hour, $minute] = array_map('intval', explode(':', $series->start_time));

        $dates = collect();
        $day = $series->starts_on->copy()->startOfDay();
        $lastDay = $series->ends_on?->copy()->endOfDay() ?? $day->copy()->addYear();

        while ($dates->count() < $limit && $day->lte($lastDay)) {
            if ($weekdays->contains($day->dayOfWeekIso)) {
                $dates->push($day->copy()->setTime($hour, $minute));
            }

            $day->addDay();
        }

        return $dates;
    }
}
