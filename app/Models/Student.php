<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use App\Enums\SchoolGrade;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $guardian_id
 * @property string $name
 * @property SchoolGrade $school_grade
 * @property string|null $school_name
 * @property Carbon|null $birth_date
 * @property string|null $notes
 * @property bool $is_active
 * @property-read Guardian $guardian
 */
class Student extends Model
{
    protected $fillable = [
        'guardian_id', 'name', 'school_grade', 'school_name', 'birth_date', 'notes', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'school_grade' => SchoolGrade::class,
            'birth_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Guardian, $this> */
    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Guardian::class);
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Clases pendientes o confirmadas de hoy en adelante.
     *
     * @return HasMany<Appointment, $this>
     */
    public function upcomingAppointments(): HasMany
    {
        return $this->hasMany(Appointment::class)
            ->where('starts_at', '>=', now()->startOfDay())
            ->whereIn('status', [AppointmentStatus::Pending, AppointmentStatus::Confirmed]);
    }

    /** @return HasOne<Appointment, $this> */
    public function nextAppointment(): HasOne
    {
        return $this->hasOne(Appointment::class)->ofMany(
            ['starts_at' => 'min', 'id' => 'min'],
            fn (Builder $q) => $q->where('starts_at', '>=', now())
                ->whereIn('status', [AppointmentStatus::Pending, AppointmentStatus::Confirmed]),
        );
    }

    /** @return HasMany<AppointmentSeries, $this> */
    public function appointmentSeries(): HasMany
    {
        return $this->hasMany(AppointmentSeries::class);
    }

    /** @param Builder<self> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function age(): ?int
    {
        return $this->birth_date?->age;
    }

    public function firstName(): string
    {
        return strtok(trim($this->name), ' ') ?: $this->name;
    }
}
