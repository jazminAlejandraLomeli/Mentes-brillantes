<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * Maestro: su perfil se muestra en la página ("Conoce a tu maestra") y, en
 * salones con varios maestros (features.multi_teacher), se asigna a las clases.
 *
 * @property int $id
 * @property int|null $user_id para cuando cada maestro tenga su propio login
 * @property string $name nombre corto: "Miss Liz"
 * @property string|null $full_name
 * @property string|null $title "Licenciada en Pedagogía"
 * @property string|null $photo_path
 * @property string|null $bio trayectoria
 * @property string|null $education un estudio por renglón
 * @property list<string>|null $specialties
 * @property string $color
 * @property string|null $whatsapp_phone
 * @property bool $is_active disponible para agendar
 * @property bool $show_on_website
 * @property int $sort_order
 */
class Teacher extends Model
{
    protected $fillable = [
        'user_id', 'name', 'full_name', 'title', 'photo_path', 'bio', 'education', 'specialties',
        'color', 'whatsapp_phone', 'is_active', 'show_on_website', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'specialties' => 'array',
            'is_active' => 'boolean',
            'show_on_website' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function photoUrl(): ?string
    {
        return $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null;
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

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @param Builder<self> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** @param Builder<self> $query */
    public function scopeOnWebsite(Builder $query): void
    {
        $query->where('show_on_website', true);
    }

    /** @param Builder<self> $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Formación como lista (un estudio por renglón).
     *
     * @return list<string>
     */
    public function educationList(): array
    {
        return array_values(array_filter(array_map('trim', preg_split('/\R/', (string) $this->education) ?: [])));
    }
}
