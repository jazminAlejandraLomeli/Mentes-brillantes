<?php

namespace Tests\Feature\Admin;

use App\Models\Banner;
use App\Models\GalleryItem;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ContentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->signIn();
    }

    public function test_crea_un_banner_con_imagen_optimizada_a_webp(): void
    {
        $this->post('/panel/banners', [
            'title' => 'Curso de verano',
            'cta_label' => 'Quiero informes',
            'is_active' => true,
            'image' => UploadedFile::fake()->image('foto.jpg', 3000, 1500),
        ])->assertRedirect('/panel/banners')->assertSessionHas('success');

        $banner = Banner::sole();
        $this->assertStringEndsWith('.webp', $banner->image_path);
        Storage::disk('public')->assertExists($banner->image_path);

        // Se redujo al ancho máximo de banners (1920 px)
        [$width] = getimagesizefromstring(Storage::disk('public')->get($banner->image_path));
        $this->assertSame(1920, $width);
    }

    public function test_el_banner_necesita_imagen_y_muestra_errores_en_espanol(): void
    {
        $this->post('/panel/banners', ['title' => ''])
            ->assertSessionHasErrors([
                'title' => 'El campo título es obligatorio.',
                'image' => 'Sube una imagen para el banner.',
            ]);
    }

    public function test_al_cambiar_la_imagen_se_borra_la_anterior(): void
    {
        $this->post('/panel/banners', ['title' => 'A', 'image' => UploadedFile::fake()->image('a.jpg')]);
        $banner = Banner::sole();
        $old = $banner->image_path;

        $this->put("/panel/banners/{$banner->id}", ['title' => 'A2', 'image' => UploadedFile::fake()->image('b.png')])
            ->assertSessionHasNoErrors();

        Storage::disk('public')->assertMissing($old);
        Storage::disk('public')->assertExists($banner->fresh()->image_path);
        $this->assertSame('A2', $banner->fresh()->title);
    }

    public function test_activar_ordenar_y_borrar_banners(): void
    {
        $a = Banner::create(['title' => 'A', 'image_path' => 'banners/a.webp', 'sort_order' => 0]);
        $b = Banner::create(['title' => 'B', 'image_path' => 'banners/b.webp', 'sort_order' => 1]);
        Storage::disk('public')->put('banners/a.webp', 'x');

        $this->patch("/panel/banners/{$a->id}/toggle");
        $this->assertFalse($a->fresh()->is_active);

        $this->post('/panel/banners/reorder', ['ids' => [$b->id, $a->id]]);
        $this->assertSame([$b->id, $a->id], Banner::query()->ordered()->pluck('id')->all());

        $this->delete("/panel/banners/{$a->id}");
        $this->assertModelMissing($a);
        Storage::disk('public')->assertMissing('banners/a.webp');
    }

    public function test_crea_servicio_y_valida_edades(): void
    {
        $data = [
            'title' => 'Regularización de primaria',
            'category' => 'regularization',
            'short_description' => 'Apoyo en matemáticas',
            'modality' => 'hybrid',
            'age_min' => 10,
            'age_max' => 6,
        ];

        $this->post('/panel/services', $data)->assertSessionHasErrors('age_max');

        $this->post('/panel/services', [...$data, 'age_max' => 12, 'show_price' => true])
            ->assertRedirect('/panel/services');

        $service = Service::sole();
        $this->assertSame('regularizacion-de-primaria', $service->slug);
        // Sin precio escrito no se puede mostrar el precio
        $this->assertFalse($service->show_price);
    }

    public function test_sube_varias_fotos_a_la_galeria(): void
    {
        $this->post('/panel/gallery', [
            'images' => [
                UploadedFile::fake()->image('1.jpg'),
                UploadedFile::fake()->image('2.png'),
                UploadedFile::fake()->image('3.jpg'),
            ],
            'caption' => 'Taller de manualidades',
        ])->assertSessionHas('success', '3 fotos agregadas 📸');

        $this->assertSame(3, GalleryItem::count());
    }

    public function test_las_fotos_nuevas_quedan_primero_sin_orden_negativo(): void
    {
        // Antes se usaba "orden menor que el primero" → -1, que MySQL rechaza
        $old = GalleryItem::create(['image_path' => 'gallery/vieja.webp', 'sort_order' => 0]);

        $this->post('/panel/gallery', ['images' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.jpg')]])
            ->assertSessionHasNoErrors();

        $this->assertSame(0, (int) GalleryItem::min('sort_order'));
        $this->assertSame($old->id, GalleryItem::query()->ordered()->get()->last()->id);
    }

    public function test_rechaza_archivos_que_no_son_imagen(): void
    {
        $this->post('/panel/gallery', ['images' => [UploadedFile::fake()->create('virus.pdf', 10, 'application/pdf')]])
            ->assertSessionHasErrors('images.0');
    }

    public function test_cambia_colores_y_letras_de_la_pagina(): void
    {
        $this->put('/panel/settings/appearance', [
            'primary' => '#c9a0d3', 'secondary' => '#A8C4E5', 'accent' => '#F9C866',
            'background' => '#F9F5FF', 'text' => '#3E3556',
            'heading_font' => 'fredoka', 'body_font' => 'lexend',
        ])->assertSessionHasNoErrors();

        $html = $this->get('/')->getContent();
        $this->assertStringContainsString('--brand-primary: #C9A0D3', $html);
        $this->assertStringContainsString('family=Fredoka', $html);

        $this->put('/panel/settings/appearance', ['primary' => 'rosa'])->assertSessionHasErrors('primary');

        $this->delete('/panel/settings/appearance');
        $this->assertStringContainsString('--brand-primary: #F784B0', $this->get('/')->getContent());
    }
}
