<?php

namespace App\Http\Requests\Admin;

use App\Actions\Appointments\CreateAppointmentSeries;
use App\Support\SiteConfig;
use Illuminate\Validation\Rule;

/**
 * Clase recurrente: "lunes y miércoles a las 5:00 pm, 10 sesiones".
 */
class AppointmentSeriesRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'teacher_id' => [Rule::requiredIf(SiteConfig::multiTeacher()), 'nullable', 'integer', 'exists:teachers,id'],
            'subject' => ['nullable', 'string', 'max:120'],
            'weekdays' => ['required', 'array', 'min:1', 'max:7'],
            'weekdays.*' => ['integer', 'between:1,7', 'distinct'],
            'start_time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:480'],
            'starts_on' => ['required', 'date_format:Y-m-d'],
            'sessions_count' => ['nullable', 'required_without:ends_on', 'integer', 'min:1', 'max:'.CreateAppointmentSeries::MAX_SESSIONS],
            'ends_on' => ['nullable', 'required_without:sessions_count', 'date_format:Y-m-d', 'after_or_equal:starts_on', 'before_or_equal:'.now()->addYear()->toDateString()],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'student_id' => 'alumno',
            'service_id' => 'servicio',
            'teacher_id' => 'maestro',
            'subject' => 'materia',
            'weekdays' => 'días de la semana',
            'start_time' => 'hora',
            'duration_minutes' => 'duración',
            'starts_on' => 'fecha de inicio',
            'sessions_count' => 'número de clases',
            'ends_on' => 'fecha final',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'weekdays.required' => 'Elige al menos un día de la semana.',
            'sessions_count.required_without' => 'Indica cuántas clases son o hasta qué fecha.',
            'ends_on.required_without' => 'Indica cuántas clases son o hasta qué fecha.',
            'ends_on.before_or_equal' => 'Las clases recurrentes pueden programarse hasta un año.',
        ];
    }
}
