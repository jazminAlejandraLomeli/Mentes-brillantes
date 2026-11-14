<?php

namespace Tests\Feature;

use Database\Seeders\AgendaSeeder;
use Database\Seeders\ContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_las_visitas_sin_sesion_van_al_login(): void
    {
        $this->get('/panel')->assertRedirect('/login');
        $this->get('/panel/students')->assertRedirect('/login');
        $this->post('/panel/banners')->assertRedirect('/login');
    }

    public function test_el_registro_publico_esta_desactivado(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', ['email' => 'x@x.com'])->assertNotFound();
    }

    public function test_el_panel_muestra_clases_de_hoy_y_estadisticas(): void
    {
        Storage::fake('public');
        $this->seed([ContentSeeder::class, AgendaSeeder::class]);
        $this->signIn();

        $this->get('/panel')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/dashboard')
                ->has('today')
                ->has('tomorrow')
                ->has('needReminder')
                ->where('stats.active_students', 8)
                ->where('stats.active_services', 6));
    }
}
