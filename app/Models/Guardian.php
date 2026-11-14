<?php

namespace App\Models;

use App\Support\PhoneNumber;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Mamá, papá o tutor de uno o varios alumnos.
 *
 * @property int $id
 * @property string $name
 * @property string $whatsapp_phone
 * @property string|null $email
 * @property string|null $notes
 * @property-read string $whatsapp_number
 */
class Guardian extends Model
{
    protected $fillable = ['name', 'whatsapp_phone', 'email', 'notes'];

    /** @return HasMany<Student, $this> */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Teléfono listo para wa.me (solo dígitos y con lada de país).
     */
    protected function whatsappNumber(): Attribute
    {
        return Attribute::get(fn (): string => PhoneNumber::forWhatsApp($this->whatsapp_phone));
    }

    /**
     * Primer nombre para los mensajes: "Mariana López" → "Mariana".
     */
    public function firstName(): string
    {
        return strtok(trim($this->name), ' ') ?: $this->name;
    }
}
