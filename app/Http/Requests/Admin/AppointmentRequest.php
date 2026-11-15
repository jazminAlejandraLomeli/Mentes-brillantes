<?php

namespace App\Http\Requests\Admin;

use App\Enums\AppointmentStatus;
use App\Support\SiteConfig;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * Agendar o editar una clase suelta.
 */
class AppointmentRequest extends AdminRequest
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
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:480'],
            'status' => ['sometimes', Rule::enum(AppointmentStatus::class)],
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
            'date' => 'fecha',
            'time' => 'hora',
            'duration_minutes' => 'duración',
            'status' => 'estado',
            'notes' => 'notas',
        ];
    }

    /**
     * Datos listos para el modelo (fecha + hora → starts_at).
     *
     * @return array<string, mixed>
     */
    public function appointmentData(): array
    {
        $data = $this->validated();
        $data['starts_at'] = Carbon::createFromFormat('Y-m-d H:i', $data['date'].' '.$data['time']);

        return collect($data)->except(['date', 'time'])->all();
    }
}
