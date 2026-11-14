<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

/**
 * Para modelos con columna `image_path` guardada en el disco "public".
 * Agrega `image_url` con la dirección pública de la imagen.
 */
trait HasImage
{
    protected function imageUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->image_path
            ? Storage::disk('public')->url($this->image_path)
            : null);
    }
}
