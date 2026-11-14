<?php

namespace App\Http\Requests\Admin;

use App\Enums\SchoolGrade;
use App\Rules\MexicanPhone;
use App\Support\PhoneNumber;
use Illuminate\Validation\Rule;

/**
 * Alumno + su tutor. Al registrar a un niño se puede elegir un tutor
 * existente (guardian_id) o capturar uno nuevo (guardian.*).
 */
class StudentRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $newGuardian = blank($this->input('guardian_id'));

        return [
            'name' => ['required', 'string', 'max:120'],
            'school_grade' => ['required', Rule::enum(SchoolGrade::class)],
            'school_name' => ['nullable', 'string', 'max:150'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],

            'guardian_id' => ['nullable', 'integer', 'exists:guardians,id'],
            'guardian.name' => [Rule::requiredIf($newGuardian), 'nullable', 'string', 'max:120'],
            'guardian.whatsapp_phone' => [Rule::requiredIf($newGuardian), 'nullable', 'string', new MexicanPhone],
            'guardian.email' => ['nullable', 'email', 'max:150'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre del alumno',
            'school_grade' => 'grado escolar',
            'school_name' => 'escuela',
            'birth_date' => 'fecha de nacimiento',
            'notes' => 'notas',
            'guardian.name' => 'nombre del tutor',
            'guardian.whatsapp_phone' => 'WhatsApp del tutor',
            'guardian.email' => 'correo del tutor',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
        ];
    }

    /**
     * Guarda el teléfono siempre igual: 10 dígitos sin espacios ni +52.
     */
    protected function prepareForValidation(): void
    {
        $guardian = $this->input('guardian');

        if (is_array($guardian) && ($normalized = PhoneNumber::normalize($guardian['whatsapp_phone'] ?? null))) {
            $this->merge(['guardian' => [...$guardian, 'whatsapp_phone' => $normalized]]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function studentData(): array
    {
        return collect($this->validated())->except(['guardian_id', 'guardian'])->all();
    }

    /**
     * @return array{name: string, whatsapp_phone: string, email?: string|null}|null
     */
    public function newGuardianData(): ?array
    {
        return filled($this->input('guardian_id')) ? null : $this->validated('guardian');
    }
}
