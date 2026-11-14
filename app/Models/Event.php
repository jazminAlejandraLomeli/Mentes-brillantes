<?php

namespace App\Models;

use App\Models\Concerns\HasImage;
use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string $body
 * @property Carbon|null $event_date
 * @property string|null $event_time
 * @property string|null $location
 * @property string|null $image_path
 * @property bool $is_published
 */
class Event extends Model
{
    use HasImage, HasSlug;

    protected $fillable = [
        'title', 'slug', 'body', 'event_date', 'event_time', 'location', 'image_path', 'is_published',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'is_published' => 'boolean',
        ];
    }

    /** @param Builder<self> $query */
    public function scopePublished(Builder $query): void
    {
        $query->where('is_published', true);
    }

    /**
     * Para la página: avisos sin fecha + eventos de hoy en adelante,
     * los más próximos primero.
     *
     * @param  Builder<self>  $query
     */
    public function scopeUpcoming(Builder $query): void
    {
        $query->where(fn (Builder $q) => $q
            ->whereNull('event_date')
            ->orWhereDate('event_date', '>=', today()))
            ->orderByRaw('event_date is null')
            ->orderBy('event_date')
            ->orderBy('event_time');
    }
}
