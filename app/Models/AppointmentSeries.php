<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Clase que se repite (ej. lunes y miércoles 5:00 pm, 10 sesiones).
 * Sus citas individuales viven en `appointments`.
 *
 * @property int $id
 * @property int $student_id
 * @property int|null $service_id
 * @property int|null $teacher_id
 * @property string|null $subject
 * @property list<int> $weekdays ISO: 1 = lunes … 7 = domingo
 * @property string $start_time
 * @property int $duration_minutes
 * @property Carbon $starts_on
 * @property int|null $sessions_count
 * @property Carbon|null $ends_on
 * @property string|null $notes
 */
class AppointmentSeries extends Model
{
    protected $table = 'appointment_series';

    protected $attributes = [
        'duration_minutes' => 60,
    ];

    protected $fillable = [
        'student_id', 'service_id', 'teacher_id', 'subject', 'weekdays', 'start_time', 'duration_minutes',
        'starts_on', 'sessions_count', 'ends_on', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'weekdays' => 'array',
            'duration_minutes' => 'integer',
            'starts_on' => 'date',
            'sessions_count' => 'integer',
            'ends_on' => 'date',
        ];
    }

    /** @return BelongsTo<Student, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** @return BelongsTo<Service, $this> */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /** @return BelongsTo<Teacher, $this> */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class)->orderBy('starts_at');
    }

    /**
     * Clases de la serie que todavía no pasan y siguen en pie.
     *
     * @return HasMany<Appointment, $this>
     */
    public function remainingAppointments(): HasMany
    {
        return $this->hasMany(Appointment::class)
            ->where('starts_at', '>=', now())
            ->whereIn('status', [AppointmentStatus::Pending, AppointmentStatus::Confirmed]);
    }
}
