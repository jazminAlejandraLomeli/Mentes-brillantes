<?php

namespace App\Services;

use App\Models\Guardian;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

/**
 * Alta y edición de alumnos junto con su tutor.
 */
class StudentService
{
    /**
     * @param  array<string, mixed>  $studentData
     * @param  array{name: string, whatsapp_phone: string, email?: string|null}|null  $newGuardian
     */
    public function create(array $studentData, ?int $guardianId, ?array $newGuardian): Student
    {
        return DB::transaction(function () use ($studentData, $guardianId, $newGuardian): Student {
            $guardian = $this->resolveGuardian($guardianId, $newGuardian);

            return $guardian->students()->create($studentData);
        });
    }

    /**
     * @param  array<string, mixed>  $studentData
     * @param  array{name: string, whatsapp_phone: string, email?: string|null}|null  $newGuardian
     */
    public function update(Student $student, array $studentData, ?int $guardianId, ?array $newGuardian): Student
    {
        return DB::transaction(function () use ($student, $studentData, $guardianId, $newGuardian): Student {
            $guardian = $this->resolveGuardian($guardianId, $newGuardian);

            $student->update([...$studentData, 'guardian_id' => $guardian->id]);

            return $student;
        });
    }

    /**
     * Borra al alumno con sus citas. Si su tutor se queda sin niños, también se borra.
     */
    public function delete(Student $student): void
    {
        DB::transaction(function () use ($student): void {
            $guardian = $student->guardian;
            $student->delete();

            if ($guardian && $guardian->students()->doesntExist()) {
                $guardian->delete();
            }
        });
    }

    /**
     * @param  array{name: string, whatsapp_phone: string, email?: string|null}|null  $newGuardian
     */
    private function resolveGuardian(?int $guardianId, ?array $newGuardian): Guardian
    {
        if ($guardianId) {
            return Guardian::findOrFail($guardianId);
        }

        // Evita duplicar al tutor si ya existe con el mismo WhatsApp
        $lastTen = substr(preg_replace('/\D+/', '', (string) ($newGuardian['whatsapp_phone'] ?? '')) ?? '', -10);
        $existing = strlen($lastTen) < 10 ? null : Guardian::query()
            ->where('whatsapp_phone', 'like', '%'.substr($lastTen, -4))
            ->get()
            ->first(fn (Guardian $g) => substr(preg_replace('/\D+/', '', $g->whatsapp_phone) ?? '', -10) === $lastTen);

        return $existing ?? Guardian::create($newGuardian ?? []);
    }
}
