<?php

namespace App\Http\Requests\Admin;

use App\Enums\Modality;
use App\Enums\ServiceCategory;
use Illuminate\Validation\Rule;

class ServiceRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:120'],
            'category' => ['required', Rule::enum(ServiceCategory::class)],
            'short_description' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'age_min' => ['nullable', 'integer', 'min:1', 'max:99'],
            'age_max' => ['nullable', 'integer', 'min:1', 'max:99', 'gte:age_min'],
            'modality' => ['required', Rule::enum(Modality::class)],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999'],
            'price_note' => ['nullable', 'string', 'max:60'],
            'show_price' => ['boolean'],
            'is_featured' => ['boolean'],
            'is_active' => ['boolean'],
            'image' => ['nullable', ...self::IMAGE_RULES],
            'remove_image' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'título',
            'category' => 'categoría',
            'short_description' => 'descripción corta',
            'description' => 'descripción',
            'age_min' => 'edad mínima',
            'age_max' => 'edad máxima',
            'modality' => 'modalidad',
            'price' => 'precio',
            'price_note' => 'nota del precio',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...parent::messages(),
            'age_max.gte' => 'La edad máxima debe ser mayor o igual a la mínima.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Si Liz quiere mostrar el precio, debe escribirlo
        if ($this->boolean('show_price') && blank($this->input('price'))) {
            $this->merge(['show_price' => false]);
        }
    }
}
