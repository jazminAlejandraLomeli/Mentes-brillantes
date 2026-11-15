<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Una clase en la agenda.
 *
 * @property int $id
 * @property int $student_id
 * @property int|null $service_id
 * @property int|null $teacher_id
 * @property int|null $appointment_series_id
 * @property string|null $subject
 * @property Carbon $starts_at
 * @property int $duration_minutes
 * @property AppointmentStatus $status
 * @property string|null $notes
 * @property Carbon|null $reminder_sent_at
 * @property-read Student $student
 * @property-read Service|null $service
 * @property-read Teacher|null $teacher
 */
class Appointment extends Model
{
    protected $fillable = [
        'student_id', 'service_id', 'teacher_id', 'appointment_series_id', 'subject', 'starts_at',
        'duration_minutes', 'status', 'notes', 'reminder_sent_at',
    ];

    protected $attributes = [
        'status' => 'pending',
        'duration_minutes' => 60,
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'duration_minutes' => 'integer',
            'status' => AppointmentStatus::class,
            'reminder_sent_at' => 'datetime',
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

    /** @return BelongsTo<AppointmentSeries, $this> */
    public function series(): BelongsTo
    {
        return $this->belongsTo(AppointmentSeries::class, 'appointment_series_id');
    }

    public function endsAt(): Carbon
    {
        return $this->starts_at->copy()->addMinutes($this->duration_minutes);
    }

    /**
     * Lo que se estudia en la clase: la materia escrita o, si no hay, el servicio.
     */
    public function topic(): string
    {
        return $this->subject ?: ($this->service?->title ?? 'clase');
    }

    /** @param Builder<self> $query */
    public function scopeUpcoming(Builder $query): void
    {
        $query->where('starts_at', '>=', now()->startOfDay())->orderBy('starts_at');
    }

    /** @param Builder<self> $query */
    public function scopeOnDate(Builder $query, Carbon|string $date): void
    {
        $query->whereDate('starts_at', $date);
    }

    /**
     * Citas pendientes o confirmadas (las que siguen en pie).
     *
     * @param  Builder<self>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereIn('status', [AppointmentStatus::Pending, AppointmentStatus::Confirmed]);
    }
}
