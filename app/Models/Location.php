<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Sucursal (local donde se dan las clases). Se muestra en "Visítanos".
 *
 * @property int $id
 * @property string|null $name "Sucursal Centro"
 * @property string $address
 * @property string|null $landmark
 * @property string|null $schedule un horario por renglón
 * @property string|null $whatsapp_phone
 * @property string|null $maps_url
 * @property bool $is_active visible en la página
 * @property int $sort_order
 */
class Location extends Model
{
    protected $fillable = [
        'name', 'address', 'landmark', 'schedule', 'whatsapp_phone', 'maps_url', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** @param Builder<self> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** @param Builder<self> $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Horario como lista (un renglón por día o rango).
     *
     * @return list<string>
     */
    public function scheduleList(): array
    {
        return array_values(array_filter(array_map('trim', preg_split('/\R/', (string) $this->schedule) ?: [])));
    }

    /**
     * Botón "Cómo llegar": el enlace que pegó Liz o, si no hay, una búsqueda de la dirección.
     */
    public function directionsUrl(): string
    {
        return $this->maps_url ?: 'https://www.google.com/maps/search/?api=1&query='.rawurlencode($this->address);
    }

    /**
     * Mapa para mostrar dentro de la página (no necesita llave de Google).
     */
    public function mapEmbedUrl(): string
    {
        return 'https://maps.google.com/maps?q='.rawurlencode($this->address).'&z=16&output=embed';
    }
}
