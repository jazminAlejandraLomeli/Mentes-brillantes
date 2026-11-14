<?php

namespace Tests\Feature;

use App\Enums\Modality;
use App\Enums\ServiceCategory;
use App\Models\Banner;
use App\Models\Event;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LandingTest extends TestCase
{
    use RefreshDatabase;

    public function test_muestra_solo_el_contenido_activo(): void
    {
        Banner::create(['title' => 'Visible', 'image_path' => 'banners/a.webp', 'is_active' => true]);
        Banner::create(['title' => 'Oculto', 'image_path' => 'banners/b.webp', 'is_active' => false]);
        Event::create(['title' => 'Próximo', 'body' => 'x', 'event_date' => now()->addDays(3)]);
        Event::create(['title' => 'Pasado', 'body' => 'x', 'event_date' => now()->subDays(3)]);
        Event::create(['title' => 'Borrador', 'body' => 'x', 'is_published' => false]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('landing')
                ->has('banners', 1)
                ->where('banners.0.title', 'Visible')
                ->has('events', 1)
                ->where('events.0.title', 'Próximo')
                ->has('contactUrl'));
    }

    public function test_oculta_el_precio_si_liz_no_quiere_mostrarlo(): void
    {
        $base = [
            'category' => ServiceCategory::Regularization, 'short_description' => 'x',
            'modality' => Modality::InPerson, 'price' => 250, 'price_note' => 'por sesión',
        ];
        Service::create([...$base, 'title' => 'Con precio', 'show_price' => true]);
        Service::create([...$base, 'title' => 'Sin precio', 'show_price' => false]);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->has('services', 2)
            ->where('services', fn ($services) => collect($services)->firstWhere('title', 'Con precio')['price'] === '250.00'
                && collect($services)->firstWhere('title', 'Sin precio')['price'] === null
                && str_starts_with(collect($services)->first()['whatsapp_url'], 'https://api.whatsapp.com/send?phone=')));
    }
}
