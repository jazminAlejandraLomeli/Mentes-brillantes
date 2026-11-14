<?php

namespace Database\Seeders;

use App\Actions\Appointments\CreateAppointmentSeries;
use App\Enums\AppointmentStatus;
use App\Enums\SchoolGrade;
use App\Models\Appointment;
use App\Models\Guardian;
use App\Models\Service;
use App\Models\Student;
use Illuminate\Database\Seeder;

/**
 * Familias, alumnos y una agenda de ejemplo (clases sueltas y recurrentes).
 * Los teléfonos son ficticios (55 0000 00xx).
 */
class AgendaSeeder extends Seeder
{
    public function run(): void
    {
        $families = [
            ['guardian' => 'Mariana López Hernández', 'phone' => '5500000001', 'students' => [
                ['name' => 'Sofía Ramírez López', 'grade' => SchoolGrade::Primary3, 'notes' => 'Le cuestan las restas con transformación.'],
                ['name' => 'Diego Ramírez López', 'grade' => SchoolGrade::Preschool3, 'notes' => 'Inicia lectoescritura.'],
            ]],
            ['guardian' => 'Jorge Martínez Ruiz', 'phone' => '5500000002', 'students' => [
                ['name' => 'Valentina Martínez Soto', 'grade' => SchoolGrade::Primary5, 'notes' => null],
            ]],
            ['guardian' => 'Claudia Gómez Pérez', 'phone' => '5500000003', 'students' => [
                ['name' => 'Mateo Gómez Pérez', 'grade' => SchoolGrade::Secondary1, 'notes' => 'Preparación para examen de álgebra.'],
            ]],
            ['guardian' => 'Fernanda Torres Díaz', 'phone' => '5500000004', 'students' => [
                ['name' => 'Regina Castillo Torres', 'grade' => SchoolGrade::Primary1, 'notes' => 'Alérgica al cacahuate.'],
            ]],
            ['guardian' => 'Alejandro Navarro Cruz', 'phone' => '5500000005', 'students' => [
                ['name' => 'Emiliano Navarro Vega', 'grade' => SchoolGrade::Primary4, 'notes' => null],
                ['name' => 'Camila Navarro Vega', 'grade' => SchoolGrade::Primary2, 'notes' => null],
            ]],
            ['guardian' => 'Patricia Flores Mendoza', 'phone' => '5500000006', 'students' => [
                ['name' => 'Santiago Morales Flores', 'grade' => SchoolGrade::Primary6, 'notes' => 'Le gusta mucho dibujar.'],
            ]],
        ];

        $students = collect();

        foreach ($families as $family) {
            $guardian = Guardian::create([
                'name' => $family['guardian'],
                'whatsapp_phone' => $family['phone'],
            ]);

            foreach ($family['students'] as $data) {
                $students->put($data['name'], Student::create([
                    'guardian_id' => $guardian->id,
                    'name' => $data['name'],
                    'school_grade' => $data['grade'],
                    'notes' => $data['notes'],
                    'is_active' => true,
                ]));
            }
        }

        $primaria = Service::query()->where('title', 'Regularización de primaria')->first();
        $secundaria = Service::query()->where('title', 'Regularización de secundaria')->first();
        $lectura = Service::query()->where('title', 'Lectoescritura')->first();

        // Clases recurrentes
        $series = app(CreateAppointmentSeries::class);
        $nextMonday = now()->startOfWeek()->addWeek();

        $sofia = $series->handle([
            'student_id' => $students['Sofía Ramírez López']->id,
            'service_id' => $primaria?->id,
            'subject' => 'Matemáticas',
            'weekdays' => [1, 3],              // lunes y miércoles
            'start_time' => '17:00',
            'duration_minutes' => 60,
            'starts_on' => now()->startOfWeek()->subWeek(), // empezó la semana pasada
            'sessions_count' => 10,
        ]);

        // Las clases que ya pasaron, como completadas
        $sofia->appointments()->where('starts_at', '<', now())->update(['status' => AppointmentStatus::Completed]);

        $series->handle([
            'student_id' => $students['Diego Ramírez López']->id,
            'service_id' => $lectura?->id,
            'subject' => 'Lectoescritura',
            'weekdays' => [2, 4],              // martes y jueves
            'start_time' => '16:00',
            'duration_minutes' => 45,
            'starts_on' => $nextMonday,
            'ends_on' => $nextMonday->copy()->addWeeks(4),
        ]);

        // Clases sueltas
        $oneOff = [
            ['student' => 'Mateo Gómez Pérez', 'service' => $secundaria, 'subject' => 'Álgebra', 'at' => now()->addDay()->setTime(18, 0), 'status' => AppointmentStatus::Confirmed],
            ['student' => 'Valentina Martínez Soto', 'service' => $primaria, 'subject' => 'Fracciones', 'at' => now()->addDays(2)->setTime(16, 30), 'status' => AppointmentStatus::Pending],
            ['student' => 'Regina Castillo Torres', 'service' => $lectura, 'subject' => null, 'at' => now()->addDays(3)->setTime(10, 0), 'status' => AppointmentStatus::Pending],
            ['student' => 'Emiliano Navarro Vega', 'service' => $primaria, 'subject' => 'Tablas de multiplicar', 'at' => now()->setTime(17, 0), 'status' => AppointmentStatus::Confirmed],
            ['student' => 'Camila Navarro Vega', 'service' => $primaria, 'subject' => 'Comprensión lectora', 'at' => now()->subDays(3)->setTime(16, 0), 'status' => AppointmentStatus::Completed],
            ['student' => 'Santiago Morales Flores', 'service' => $primaria, 'subject' => 'Geometría', 'at' => now()->subDay()->setTime(18, 0), 'status' => AppointmentStatus::Cancelled],
        ];

        foreach ($oneOff as $item) {
            Appointment::create([
                'student_id' => $students[$item['student']]->id,
                'service_id' => $item['service']?->id,
                'subject' => $item['subject'],
                'starts_at' => $item['at'],
                'duration_minutes' => 60,
                'status' => $item['status'],
            ]);
        }
    }
}
