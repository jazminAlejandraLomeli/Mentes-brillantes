<?php

namespace Tests\Feature\Admin;

use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Sucursales: dirección, horario y mapa en la sección "Visítanos".
 */
class LocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_agrega_una_sucursal_con_horario_y_whatsapp_propio(): void
    {
        $this->signIn();

        $this->post('/panel/locations', [
            'name' => 'Sucursal Centro',
            'address' => "  Av. Juárez 123,\n  Col. Centro, Tepatitlán  ",
            'landmark' => 'Frente a la plaza',
            'schedule' => "Lunes a viernes · 3 a 8 pm\n\n  Sábados · 9 a 1  ",
            'whatsapp_phone' => '+52 1 378 122 0818',
            'is_active' => true,
        ])->assertRedirect('/panel/locations')->assertSessionHasNoErrors();

        $location = Location::sole();
        $this->assertSame('Av. Juárez 123, Col. Centro, Tepatitlán', $location->address);
        $this->assertSame('3781220818', $location->whatsapp_phone);
        $this->assertSame(['Lunes a viernes · 3 a 8 pm', 'Sábados · 9 a 1'], $location->scheduleList());
    }

    public function test_la_direccion_es_obligatoria_y_el_mapa_debe_ser_un_enlace(): void
    {
        $this->signIn();

        $this->post('/panel/locations', ['address' => '   ', 'maps_url' => 'mi casa'])
            ->assertSessionHasErrors(['address', 'maps_url']);

        $this->assertSame(0, Location::count());
    }

    public function test_como_llegar_usa_el_enlace_de_maps_o_busca_la_direccion(): void
    {
        $conEnlace = Location::create(['address' => 'Av. Juárez 123', 'maps_url' => 'https://maps.app.goo.gl/abc']);
        $sinEnlace = Location::create(['address' => 'Av. Juárez 123, Centro']);

        $this->assertSame('https://maps.app.goo.gl/abc', $conEnlace->directionsUrl());
        $this->assertSame('https://www.google.com/maps/search/?api=1&query=Av.%20Ju%C3%A1rez%20123%2C%20Centro', $sinEnlace->directionsUrl());
        $this->assertStringContainsString('output=embed', $sinEnlace->mapEmbedUrl());
    }

    public function test_la_pagina_solo_muestra_las_sucursales_visibles_en_su_orden(): void
    {
        Location::create(['name' => 'Norte', 'address' => 'Calle 2', 'sort_order' => 2]);
        Location::create(['name' => 'Centro', 'address' => 'Calle 1', 'sort_order' => 1]);
        Location::create(['name' => 'Cerrada', 'address' => 'Calle 3', 'is_active' => false]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->component('landing')
            ->has('locations', 2)
            ->where('locations.0.name', 'Centro')
            ->where('locations.1.name', 'Norte')
            ->where('locations.0.whatsapp_url', null));
    }

    public function test_ocultar_reordenar_y_eliminar(): void
    {
        $this->signIn();
        $a = Location::create(['name' => 'A', 'address' => 'Calle 1', 'sort_order' => 0]);
        $b = Location::create(['name' => 'B', 'address' => 'Calle 2', 'sort_order' => 1]);

        $this->patch("/panel/locations/{$a->id}/toggle")->assertSessionHas('success');
        $this->assertFalse($a->fresh()->is_active);

        $this->post('/panel/locations/reorder', ['ids' => [$b->id, $a->id]])->assertSessionHas('success');
        $this->assertSame(0, $b->fresh()->sort_order);

        $this->delete("/panel/locations/{$b->id}")->assertRedirect('/panel/locations');
        $this->assertNull($b->fresh());
    }

    public function test_el_panel_lista_las_sucursales_y_pide_iniciar_sesion(): void
    {
        $this->get('/panel/locations')->assertRedirect('/login');

        $this->signIn();
        Location::create(['address' => 'Calle 1']);

        $this->get('/panel/locations')->assertInertia(fn (Assert $page) => $page
            ->component('admin/locations/index')
            ->has('locations', 1));
        $this->get('/panel/locations/create')->assertInertia(fn (Assert $page) => $page->component('admin/locations/form'));
    }
}
