<?php

namespace App\Models;

use App\Enums\Modality;
use App\Enums\ServiceCategory;
use App\Models\Concerns\HasImage;
use App\Models\Concerns\HasSlug;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property ServiceCategory $category
 * @property string $short_description
 * @property string|null $description
 * @property int|null $age_min
 * @property int|null $age_max
 * @property Modality $modality
 * @property string|null $price
 * @property string|null $price_note
 * @property bool $show_price
 * @property string|null $image_path
 * @property bool $is_featured
 * @property bool $is_active
 * @property int $sort_order
 */
class Service extends Model
{
    use HasImage, HasSlug;

    protected $fillable = [
        'title', 'slug', 'category', 'short_description', 'description', 'age_min', 'age_max',
        'modality', 'price', 'price_note', 'show_price', 'image_path', 'is_featured', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'category' => ServiceCategory::class,
            'modality' => Modality::class,
            'age_min' => 'integer',
            'age_max' => 'integer',
            'price' => 'decimal:2',
            'show_price' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** @return HasMany<Appointment, $this> */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /** @param Builder<self> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /** @param Builder<self> $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderByDesc('is_featured')->orderBy('sort_order')->orderBy('title');
    }

    /**
     * Texto amigable del rango de edad: "6 a 12 años", "Desde 4 años"…
     */
    public function ageRangeLabel(): ?string
    {
        return match (true) {
            $this->age_min && $this->age_max => "{$this->age_min} a {$this->age_max} años",
            (bool) $this->age_min => "Desde {$this->age_min} años",
            (bool) $this->age_max => "Hasta {$this->age_max} años",
            default => null,
        };
    }
}
