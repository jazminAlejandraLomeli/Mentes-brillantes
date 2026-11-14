<?php

namespace Tests\Feature\Admin;

use App\Enums\AppointmentStatus;
use App\Enums\SchoolGrade;
use App\Models\Appointment;
use App\Models\AppointmentSeries;
use App\Models\Guardian;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AgendaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-11-12 10:00:00'); // jueves
        $this->signIn();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function student(): Student
    {
        $guardian = Guardian::create(['name' => 'Mariana López', 'whatsapp_phone' => '33 1234 5678']);

        return $guardian->students()->create(['name' => 'Sofía Ramírez', 'school_grade' => SchoolGrade::Primary3]);
    }

    public function test_registra_alumno_con_tutor_nuevo_y_no_duplica_al_tutor(): void
    {
        $this->post('/panel/students', [
            'name' => 'Sofía Ramírez',
            'school_grade' => 'primary_3',
            'guardian' => ['name' => 'Mariana López', 'whatsapp_phone' => '33 1234 5678'],
        ])->assertRedirect()->assertSessionHasNoErrors();

        // Hermanito: mismo WhatsApp escrito diferente → mismo tutor
        $this->post('/panel/students', [
            'name' => 'Diego Ramírez',
            'school_grade' => 'preschool_3',
            'guardian' => ['name' => 'Mariana', 'whatsapp_phone' => '+52 (33) 1234-5678'],
        ])->assertSessionHasNoErrors();

        $this->assertSame(1, Guardian::count());
        $this->assertSame(2, Guardian::sole()->students()->count());
    }

    public function test_pide_whatsapp_de_exactamente_10_digitos(): void
    {
        foreach (['123', '33123456789', '3312345678901234', 'abcdefghij'] as $phone) {
            $this->post('/panel/students', [
                'name' => 'Sofía', 'school_grade' => 'primary_3',
                'guardian' => ['name' => 'Mariana', 'whatsapp_phone' => $phone],
            ])->assertSessionHasErrors(['guardian.whatsapp_phone' => 'El WhatsApp debe tener 10 dígitos, por ejemplo 378 122 0818.']);
        }

        $this->assertSame(0, Guardian::count());
    }

    public function test_guarda_el_whatsapp_en_10_digitos_sin_importar_como_se_escriba(): void
    {
        $this->post('/panel/students', [
            'name' => 'Sofía', 'school_grade' => 'primary_3',
            'guardian' => ['name' => 'Mariana', 'whatsapp_phone' => '+52 (378) 122-0818'],
        ])->assertSessionHasNoErrors();

        $this->assertSame('3781220818', Guardian::sole()->whatsapp_phone);

        // Editar al tutor también valida y normaliza
        $guardian = Guardian::sole();
        $this->put("/panel/guardians/{$guardian->id}", ['name' => 'Mariana', 'whatsapp_phone' => '378 122 08189'])
            ->assertSessionHasErrors('whatsapp_phone');
        $this->put("/panel/guardians/{$guardian->id}", ['name' => 'Mariana', 'whatsapp_phone' => '33 1234 5678'])
            ->assertSessionHasNoErrors();
        $this->assertSame('3312345678', $guardian->fresh()->whatsapp_phone);
    }

    public function test_agenda_clase_y_ofrece_mensaje_de_whatsapp_prellenado(): void
    {
        $student = $this->student();

        $this->post('/panel/appointments', [
            'student_id' => $student->id,
            'subject' => 'Matemáticas',
            'date' => '2026-11-16',
            'time' => '17:00',
            'duration_minutes' => 60,
        ])->assertSessionHas('success');

        $link = session('whatsapp')['url'];
        $this->assertStringStartsWith('https://api.whatsapp.com/send?phone=523312345678&text=', $link);

        $message = rawurldecode(substr($link, strpos($link, '&text=') + 6));
        // El emoji va codificado en UTF-8 (no como "�")
        $this->assertStringContainsString('%F0%9F%8C%9F', $link);
        $this->assertStringContainsString('Mentes Brillantes 🌟', $message);
        $this->assertStringContainsString('¡Hola Mariana!', $message);
        $this->assertStringContainsString('la clase de Matemáticas de Sofía el día lunes 16 de noviembre a las 5:00 pm', $message);
    }

    public function test_avisa_si_se_enciman_dos_clases(): void
    {
        $student = $this->student();
        Appointment::create(['student_id' => $student->id, 'starts_at' => '2026-11-16 17:00', 'duration_minutes' => 60]);

        $this->post('/panel/appointments', [
            'student_id' => $student->id, 'date' => '2026-11-16', 'time' => '17:30', 'duration_minutes' => 60,
        ])->assertSessionHas('warning', fn ($w) => str_contains($w, 'Sofía (17:00)'));
    }

    public function test_reagendar_limpia_el_recordatorio_y_ofrece_avisar(): void
    {
        $student = $this->student();
        $appointment = Appointment::create([
            'student_id' => $student->id, 'starts_at' => '2026-11-16 17:00',
            'status' => AppointmentStatus::Confirmed, 'reminder_sent_at' => now(),
        ]);

        $this->put("/panel/appointments/{$appointment->id}", [
            'student_id' => $student->id, 'date' => '2026-11-18', 'time' => '16:00', 'duration_minutes' => 60,
        ])->assertSessionHas('success', 'Clase reagendada.');

        $appointment->refresh();
        $this->assertNull($appointment->reminder_sent_at);
        $this->assertSame(AppointmentStatus::Pending, $appointment->status);
        $this->assertStringContainsString(rawurlencode('reagendada para el día miércoles 18 de noviembre'), session('whatsapp')['url']);
    }

    public function test_cancelar_ofrece_mensaje_de_cancelacion_y_se_marca_recordatorio(): void
    {
        $appointment = Appointment::create(['student_id' => $this->student()->id, 'starts_at' => '2026-11-16 17:00']);

        $this->post("/panel/appointments/{$appointment->id}/reminder-sent");
        $this->assertNotNull($appointment->fresh()->reminder_sent_at);

        $this->patch("/panel/appointments/{$appointment->id}/status", ['status' => 'cancelled'])
            ->assertSessionHas('whatsapp', fn ($w) => str_contains(rawurldecode($w['url']), 'queda cancelada'));

        $this->assertSame(AppointmentStatus::Cancelled, $appointment->fresh()->status);
    }

    public function test_clases_recurrentes_y_cancelar_las_que_faltan(): void
    {
        $student = $this->student();

        $this->post('/panel/appointment-series', [
            'student_id' => $student->id,
            'subject' => 'Lectura',
            'weekdays' => [1, 3],
            'start_time' => '17:00',
            'duration_minutes' => 60,
            'starts_on' => '2026-11-02', // empezó hace dos semanas
            'sessions_count' => 10,
        ])->assertSessionHas('success', fn ($m) => str_contains($m, '10 clases (lunes y miércoles a las 5:00 pm)'));

        $series = AppointmentSeries::sole();
        $this->assertSame(10, $series->appointments()->count());

        // Hoy es jueves 12: ya pasaron 2, 4, 9 y 11 de noviembre → quedan 6
        $this->patch("/panel/appointment-series/{$series->id}/cancel")
            ->assertSessionHas('success', 'Se cancelaron 6 clases.');

        $this->assertSame(4, $series->appointments()->where('status', '!=', AppointmentStatus::Cancelled)->count());
    }

    public function test_la_serie_pide_numero_de_clases_o_fecha_final(): void
    {
        $this->post('/panel/appointment-series', [
            'student_id' => $this->student()->id, 'weekdays' => [1], 'start_time' => '17:00',
            'duration_minutes' => 60, 'starts_on' => '2026-11-16',
        ])->assertSessionHasErrors(['sessions_count', 'ends_on']);
    }

    public function test_la_agenda_filtra_por_semana(): void
    {
        $student = $this->student();
        Appointment::create(['student_id' => $student->id, 'starts_at' => '2026-11-10 17:00']); // esta semana
        Appointment::create(['student_id' => $student->id, 'starts_at' => '2026-11-20 17:00']); // la próxima

        $this->get('/panel/appointments?view=week&date=2026-11-12')
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/appointments/index')
                ->has('appointments', 1)
                ->where('range.from', '2026-11-09')
                ->where('range.to', '2026-11-15')
                ->has('appointments.0.whatsapp.reminder'));
    }

    public function test_la_agenda_filtra_por_alumno(): void
    {
        $sofia = $this->student();
        $diego = $sofia->guardian->students()->create(['name' => 'Diego Ramírez', 'school_grade' => SchoolGrade::Preschool3]);
        Appointment::create(['student_id' => $sofia->id, 'starts_at' => '2026-11-16 17:00']);
        Appointment::create(['student_id' => $sofia->id, 'starts_at' => '2026-11-18 17:00']);
        Appointment::create(['student_id' => $diego->id, 'starts_at' => '2026-11-17 16:00']);

        $this->get("/panel/appointments?view=list&date=2026-11-12&student_id={$sofia->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->has('appointments', 2)
                ->where('appointments.0.student_id', $sofia->id)
                ->where('appointments.1.student_id', $sofia->id)
                ->where('filters.student_id', $sofia->id));
    }

    public function test_borrar_alumno_borra_al_tutor_si_se_queda_sin_ninos(): void
    {
        $student = $this->student();
        Appointment::create(['student_id' => $student->id, 'starts_at' => '2026-11-16 17:00']);

        $this->delete("/panel/students/{$student->id}")->assertRedirect('/panel/students');

        $this->assertSame(0, Guardian::count());
        $this->assertSame(0, Appointment::count());
    }
}
