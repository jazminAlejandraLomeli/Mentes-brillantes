<?php

namespace Tests\Feature\Admin;

use App\Enums\SchoolGrade;
use App\Models\Appointment;
use App\Models\AppointmentSeries;
use App\Models\Guardian;
use App\Models\Student;
use App\Models\Teacher;
use App\Support\SiteConfig;
use App\Support\WhatsAppLink;
use App\Support\WhatsAppTemplates;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Salón con varios maestros (features.multi_teacher = true).
 */
class MultiTeacherTest extends TestCase
{
    use RefreshDatabase;

    private Student $student;

    private Teacher $karla;

    private Teacher $pedro;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow('2026-11-12 10:00:00');
        SiteConfig::fake(['business' => ['name' => 'Salón Arcoíris', 'owner' => 'Laura'], 'features' => ['multi_teacher' => true]]);
        $this->signIn();

        $guardian = Guardian::create(['name' => 'Mariana López', 'whatsapp_phone' => '3312345678']);
        $this->student = $guardian->students()->create(['name' => 'Sofía Ramírez', 'school_grade' => SchoolGrade::Primary3]);
        $this->karla = Teacher::create(['name' => 'Miss Karla', 'color' => '#F784B0']);
        $this->pedro = Teacher::create(['name' => 'Profe Pedro', 'color' => '#4BBBE5']);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        SiteConfig::flush();
        parent::tearDown();
    }

    private function appointmentData(array $overrides = []): array
    {
        return [
            'student_id' => $this->student->id,
            'teacher_id' => $this->karla->id,
            'subject' => 'Matemáticas',
            'date' => '2026-11-16',
            'time' => '17:00',
            'duration_minutes' => 60,
            ...$overrides,
        ];
    }

    public function test_alta_edicion_y_baja_de_maestros(): void
    {
        $this->post('/panel/teachers', ['name' => 'Miss Ana', 'color' => '#87d068', 'whatsapp_phone' => '+52 33 9876 5432'])
            ->assertSessionHasNoErrors();

        $ana = Teacher::where('name', 'Miss Ana')->sole();
        $this->assertSame('#87D068', $ana->color);
        $this->assertSame('3398765432', $ana->whatsapp_phone);

        $this->post('/panel/teachers', ['name' => '', 'color' => 'rojo'])->assertSessionHasErrors(['name', 'color']);

        $this->patch("/panel/teachers/{$ana->id}/toggle");
        $this->assertFalse($ana->fresh()->is_active);

        $this->get('/panel/teachers')->assertInertia(fn (Assert $page) => $page->component('admin/teachers/index')->has('teachers', 3));
    }

    public function test_al_agendar_hay_que_elegir_maestro(): void
    {
        $this->post('/panel/appointments', $this->appointmentData(['teacher_id' => null]))->assertSessionHasErrors('teacher_id');

        $this->post('/panel/appointments', $this->appointmentData())->assertSessionHasNoErrors();
        $this->assertSame($this->karla->id, Appointment::sole()->teacher_id);
    }

    public function test_el_aviso_de_choque_solo_cuenta_clases_del_mismo_maestro(): void
    {
        Appointment::create(['student_id' => $this->student->id, 'teacher_id' => $this->karla->id, 'starts_at' => '2026-11-16 17:00']);

        // Pedro a la misma hora: sin aviso
        $this->post('/panel/appointments', $this->appointmentData(['teacher_id' => $this->pedro->id]))
            ->assertSessionMissing('warning');

        // Karla a la misma hora: avisa
        $this->post('/panel/appointments', $this->appointmentData())
            ->assertSessionHas('warning', fn ($w) => str_contains($w, 'ese maestro ya tiene clase'));
    }

    public function test_las_clases_recurrentes_guardan_al_maestro(): void
    {
        $this->post('/panel/appointment-series', [
            'student_id' => $this->student->id,
            'teacher_id' => $this->pedro->id,
            'weekdays' => [2, 4],
            'start_time' => '16:00',
            'duration_minutes' => 60,
            'starts_on' => '2026-11-16',
            'sessions_count' => 4,
        ])->assertSessionHasNoErrors();

        $series = AppointmentSeries::sole();
        $this->assertSame($this->pedro->id, $series->teacher_id);
        $this->assertSame([$this->pedro->id], $series->appointments()->pluck('teacher_id')->unique()->values()->all());
    }

    public function test_la_agenda_filtra_por_maestro_y_manda_los_colores(): void
    {
        Appointment::create(['student_id' => $this->student->id, 'teacher_id' => $this->karla->id, 'starts_at' => '2026-11-16 17:00']);
        Appointment::create(['student_id' => $this->student->id, 'teacher_id' => $this->pedro->id, 'starts_at' => '2026-11-17 17:00']);

        $this->get("/panel/appointments?view=list&date=2026-11-12&teacher_id={$this->pedro->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->has('teachers', 2)
                ->has('appointments', 1)
                ->where('appointments.0.teacher.name', 'Profe Pedro')
                ->where('appointments.0.teacher.color', '#4BBBE5'));
    }

    public function test_whatsapp_puede_decir_con_que_maestro_es_la_clase(): void
    {
        $appointment = Appointment::create(['student_id' => $this->student->id, 'teacher_id' => $this->karla->id, 'starts_at' => '2026-11-16 17:00']);
        $this->put('/panel/settings/messages', [
            WhatsAppTemplates::REMINDER => 'Hola {tutor}, clase de {alumno} con {maestro} el {fecha}.',
            WhatsAppTemplates::CANCELLATION => WhatsAppTemplates::DEFAULTS[WhatsAppTemplates::CANCELLATION],
            WhatsAppTemplates::RESCHEDULE => WhatsAppTemplates::DEFAULTS[WhatsAppTemplates::RESCHEDULE],
        ])->assertSessionHasNoErrors();

        $this->assertSame(
            'Hola Mariana, clase de Sofía con Miss Karla el lunes 16 de noviembre.',
            WhatsAppLink::messageForAppointment($appointment, WhatsAppTemplates::REMINDER),
        );
    }

    public function test_borrar_maestro_conserva_sus_clases(): void
    {
        $appointment = Appointment::create(['student_id' => $this->student->id, 'teacher_id' => $this->karla->id, 'starts_at' => '2026-11-16 17:00']);

        $this->delete("/panel/teachers/{$this->karla->id}")->assertSessionHas('success');

        $this->assertModelExists($appointment);
        $this->assertNull($appointment->fresh()->teacher_id);
    }

    public function test_con_la_funcion_apagada_la_agenda_no_pide_maestro(): void
    {
        SiteConfig::fake(['features' => ['multi_teacher' => false]]);

        // El módulo de maestros sigue existiendo (para el perfil de la página)
        $this->get('/panel/teachers')->assertOk();
        // Y se puede agendar sin maestro, como Liz
        $this->post('/panel/appointments', $this->appointmentData(['teacher_id' => null]))->assertSessionHasNoErrors();
        $this->get('/panel/appointments')->assertInertia(fn (Assert $page) => $page->where('teachers', []));
    }
}
