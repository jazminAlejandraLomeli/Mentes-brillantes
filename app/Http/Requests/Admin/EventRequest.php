<?php

namespace App\Http\Requests\Admin;

class EventRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:5000'],
            'event_date' => ['nullable', 'date'],
            'event_time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:150'],
            'is_published' => ['boolean'],
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
            'body' => 'texto',
            'event_date' => 'fecha',
            'event_time' => 'hora',
            'location' => 'lugar',
        ];
    }
}
