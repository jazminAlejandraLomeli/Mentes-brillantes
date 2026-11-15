<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Support\BrandAssets;
use App\Support\SiteConfig;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * El mismo código debe servir para otro cliente cambiando solo site.json y el logo.
 */
class WhiteLabelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        SiteConfig::fake([
            'business' => ['name' => 'Pequeños Genios', 'full_name' => 'Pequeños Genios by Ana', 'owner' => 'Ana'],
            'whatsapp' => ['phone' => '3312345678'],
            'categories' => [
                ['key' => 'kids', 'label' => 'Inglés para niños', 'color' => 'primary'],
                ['key' => 'teens', 'label' => 'Inglés para adolescentes', 'color' => 'accent'],
            ],
        ]);
    }

    protected function tearDown(): void
    {
        SiteConfig::flush();
        parent::tearDown();
    }

    public function test_la_pagina_usa_el_nombre_y_las_categorias_del_cliente(): void
    {
        Service::create([
            'title' => 'Inglés divertido', 'category' => 'kids', 'short_description' => 'x', 'modality' => 'online',
        ]);

        $response = $this->get('/');
        $response->assertInertia(fn (Assert $page) => $page
            ->where('name', 'Pequeños Genios by Ana')
            ->where('site.business.owner', 'Ana')
            ->where('categories.0.label', 'Inglés para niños')
            ->where('services.0.category_label', 'Inglés para niños')
            ->where('services.0.category_color', 'primary')
            ->where('services.0.whatsapp_url', fn ($url) => str_contains(rawurldecode($url), 'de Pequeños Genios')));

        $html = $response->getContent();
        $this->assertStringContainsString('<title inertia>Pequeños Genios by Ana</title>', $html);
        $this->assertStringNotContainsString('Mentes Brillantes', $html);
    }

    public function test_solo_acepta_las_categorias_del_cliente(): void
    {
        $this->signIn();
        $base = ['title' => 'Curso', 'short_description' => 'x', 'modality' => 'online'];

        $this->post('/panel/services', [...$base, 'category' => 'regularization'])->assertSessionHasErrors('category');
        $this->post('/panel/services', [...$base, 'category' => 'teens'])->assertSessionHasNoErrors();
    }

    public function test_subir_logo_genera_los_iconos_y_se_puede_quitar(): void
    {
        Storage::fake('public');
        $this->signIn();

        // Sin logo: icono por defecto (arcoíris)
        $this->assertStringContainsString('favicon.svg', $this->get('/')->getContent());

        $this->post('/panel/settings/logo', ['logo' => UploadedFile::fake()->image('logo.png', 600, 200)])
            ->assertSessionHasNoErrors()->assertSessionHas('success');

        $paths = BrandAssets::paths();
        foreach ($paths as $path) {
            Storage::disk('public')->assertExists($path);
        }
        $this->assertSame([64, 64], array_slice(getimagesizefromstring(Storage::disk('public')->get($paths['icon'])), 0, 2));
        $this->assertSame([180, 180], array_slice(getimagesizefromstring(Storage::disk('public')->get($paths['apple_icon'])), 0, 2));
        $this->assertStringContainsString(basename($paths['icon']), $this->get('/')->getContent());

        $this->delete('/panel/settings/logo')->assertSessionHas('success');
        foreach ($paths as $path) {
            Storage::disk('public')->assertMissing($path);
        }
        $this->assertNull(BrandAssets::paths()['logo']);
    }

    public function test_el_logo_debe_ser_imagen(): void
    {
        $this->signIn();

        $this->post('/panel/settings/logo', ['logo' => UploadedFile::fake()->create('logo.pdf', 10, 'application/pdf')])
            ->assertSessionHasErrors('logo');
    }
}
