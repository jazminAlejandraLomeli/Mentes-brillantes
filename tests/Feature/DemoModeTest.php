<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\GalleryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DemoModeTest extends TestCase
{
    // Sin transacciones: demo:reset hace su propio migrate:fresh
    use DatabaseMigrations;

    public function test_fuera_de_la_demo_el_reinicio_no_borra_nada(): void
    {
        config(['app.demo' => false]);
        Banner::create(['title' => 'Real de Liz', 'image_path' => 'banners/real.webp']);

        $this->artisan('demo:reset', ['--force' => true])->assertFailed();

        $this->assertSame(1, Banner::count());
    }

    public function test_en_la_demo_el_reinicio_vuelve_a_los_datos_de_ejemplo(): void
    {
        Storage::fake('public');
        config(['app.demo' => true, 'app.admin.email' => 'demo@ejemplo.com', 'app.admin.password' => 'demo1234']);

        Storage::disk('public')->put('gallery/subida-por-visitante.webp', 'x');
        GalleryItem::create(['image_path' => 'gallery/subida-por-visitante.webp', 'caption' => 'Visitante']);

        $this->artisan('demo:reset', ['--force' => true])->assertSuccessful();

        Storage::disk('public')->assertMissing('gallery/subida-por-visitante.webp');
        $this->assertNull(GalleryItem::where('caption', 'Visitante')->first());
        $this->assertGreaterThan(0, Banner::count());
        $this->assertTrue(User::where('email', 'demo@ejemplo.com')->exists());
    }

    public function test_la_demo_muestra_el_acceso_y_no_deja_cambiar_la_contrasena(): void
    {
        config(['app.demo' => true, 'app.admin.email' => 'demo@ejemplo.com', 'app.admin.password' => 'demo1234']);

        $this->get('/login')->assertInertia(fn (Assert $page) => $page
            ->where('demo.email', 'demo@ejemplo.com')
            ->where('demo.password', 'demo1234'));

        $user = User::factory()->create();
        $this->actingAs($user)
            ->put('/settings/password', ['current_password' => 'password', 'password' => 'nueva-123456', 'password_confirmation' => 'nueva-123456'])
            ->assertSessionHas('error');
        $this->actingAs($user)->patch('/settings/profile', ['name' => 'Otro', 'email' => 'otro@ejemplo.com'])->assertSessionHas('error');

        $this->assertSame($user->email, $user->fresh()->email);
    }

    public function test_el_sitio_real_no_muestra_nada_de_la_demo(): void
    {
        config(['app.demo' => false]);

        $this->get('/login')->assertInertia(fn (Assert $page) => $page->where('demo', null));
    }
}
