<?php

namespace Tests\Feature;

use App\Actions\Appointments\CreateAppointmentSeries;
use App\Enums\AppointmentStatus;
use App\Enums\SchoolGrade;
use App\Models\Guardian;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class AppointmentSeriesTest extends TestCase
{
    use RefreshDatabase;

    private function makeStudent(): Student
    {
        $guardian = Guardian::create(['name' => 'Mariana López', 'whatsapp_phone' => '55 0000 0001']);

        return Student::create([
            'guardian_id' => $guardian->id,
            'name' => 'Sofía Ramírez',
            'school_grade' => SchoolGrade::Primary3,
        ]);
    }

    public function test_crea_n_sesiones_solo_en_los_dias_elegidos(): void
    {
        $series = app(CreateAppointmentSeries::class)->handle([
            'student_id' => $this->makeStudent()->id,
            'subject' => 'Matemáticas',
            'weekdays' => [1, 3],           // lunes y miércoles
            'start_time' => '17:00',
            'starts_on' => '2026-11-16',    // lunes
            'sessions_count' => 10,
        ]);

        $dates = $series->appointments->pluck('starts_at');

        $this->assertCount(10, $dates);
        $this->assertSame('2026-11-16 17:00', $dates->first()->format('Y-m-d H:i'));
        $this->assertSame('2026-12-16 17:00', $dates->last()->format('Y-m-d H:i'));
        $this->assertTrue($dates->every(fn ($d) => in_array($d->dayOfWeekIso, [1, 3], true)));
        $this->assertTrue($series->appointments->every(fn ($a) => $a->status === AppointmentStatus::Pending));
    }

    public function test_se_detiene_en_la_fecha_final(): void
    {
        $series = app(CreateAppointmentSeries::class)->handle([
            'student_id' => $this->makeStudent()->id,
            'weekdays' => [2],              // martes
            'start_time' => '16:30',
            'starts_on' => '2026-11-16',
            'ends_on' => '2026-12-08',      // martes, debe incluirse
        ]);

        $this->assertSame(
            ['2026-11-17', '2026-11-24', '2026-12-01', '2026-12-08'],
            $series->appointments->map(fn ($a) => $a->starts_at->format('Y-m-d'))->all(),
        );
    }

    public function test_pide_numero_de_clases_o_fecha_final(): void
    {
        $this->expectException(InvalidArgumentException::class);

        app(CreateAppointmentSeries::class)->handle([
            'student_id' => $this->makeStudent()->id,
            'weekdays' => [1],
            'start_time' => '17:00',
            'starts_on' => '2026-11-16',
        ]);
    }
}
