<?php

namespace Tests\Feature\Admin;

use App\Models\Teacher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Perfil de la maestra para la sección "Conoce a tu maestra" de la página.
 */
class TeacherProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->signIn();
    }

    public function test_crea_el_perfil_con_foto_especialidades_y_formacion(): void
    {
        $this->post('/panel/teachers', [
            'name' => 'Miss Liz',
            'full_name' => 'Lizbeth González Ulloa',
            'title' => 'Licenciada en Pedagogía',
            'bio' => 'Llevo años enseñando con juegos.',
            'education' => "Licenciatura en Pedagogía\n\n  Diplomado en Lectoescritura  ",
            'specialties' => ['Lectura', ' Matemáticas ', ''],
            'photo' => UploadedFile::fake()->image('liz.jpg', 1600, 2000),
            'show_on_website' => true,
        ])->assertRedirect('/panel/teachers')->assertSessionHasNoErrors();

        $liz = Teacher::sole();
        $this->assertSame(['Lectura', 'Matemáticas'], $liz->specialties);
        $this->assertSame(['Licenciatura en Pedagogía', 'Diplomado en Lectoescritura'], $liz->educationList());
        Storage::disk('public')->assertExists($liz->photo_path);
        // La foto se reduce a 900 px de ancho
        $this->assertSame(900, getimagesizefromstring(Storage::disk('public')->get($liz->photo_path))[0]);
    }

    public function test_valida_especialidades_y_foto(): void
    {
        $this->post('/panel/teachers', [
            'name' => 'Miss Liz',
            'specialties' => array_map(fn ($i) => "Materia {$i}", range(1, 13)),
            'photo' => UploadedFile::fake()->create('cv.pdf', 10, 'application/pdf'),
        ])->assertSessionHasErrors(['specialties', 'photo']);

        $this->post('/panel/teachers', ['name' => 'Miss Liz', 'specialties' => ['Lectura', 'Lectura']])
            ->assertSessionHasErrors('specialties.1');
    }

    public function test_la_pagina_solo_muestra_perfiles_visibles_y_sin_datos_privados(): void
    {
        Teacher::create(['name' => 'Miss Liz', 'whatsapp_phone' => '3312345678', 'specialties' => ['Lectura'], 'sort_order' => 1]);
        Teacher::create(['name' => 'Oculta', 'show_on_website' => false]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->has('teachers', 1)
            ->where('teachers.0.name', 'Miss Liz')
            ->where('teachers.0.specialties', ['Lectura'])
            ->missing('teachers.0.whatsapp_phone'));
    }

    public function test_cambiar_foto_borra_la_anterior_y_dar_de_baja_borra_la_foto(): void
    {
        $this->post('/panel/teachers', ['name' => 'Miss Liz', 'photo' => UploadedFile::fake()->image('a.jpg')]);
        $liz = Teacher::sole();
        $old = $liz->photo_path;

        $this->put("/panel/teachers/{$liz->id}", ['name' => 'Miss Liz', 'photo' => UploadedFile::fake()->image('b.jpg')])
            ->assertSessionHasNoErrors();
        Storage::disk('public')->assertMissing($old);

        $new = $liz->fresh()->photo_path;
        $this->delete("/panel/teachers/{$liz->id}")->assertRedirect('/panel/teachers');
        Storage::disk('public')->assertMissing($new);
        $this->assertSame(0, Teacher::count());
    }

    public function test_ocultar_de_la_pagina_y_ordenar(): void
    {
        $a = Teacher::create(['name' => 'A', 'sort_order' => 0]);
        $b = Teacher::create(['name' => 'B', 'sort_order' => 1]);

        $this->patch("/panel/teachers/{$a->id}/website");
        $this->assertFalse($a->fresh()->show_on_website);

        $this->post('/panel/teachers/reorder', ['ids' => [$b->id, $a->id]]);
        $this->assertSame([$b->id, $a->id], Teacher::query()->ordered()->pluck('id')->all());
    }
}
