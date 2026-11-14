<?php

namespace Database\Seeders;

use App\Enums\Modality;
use App\Enums\ServiceCategory;
use App\Models\Banner;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\Service;
use Database\Seeders\Support\PlaceholderImage;
use Illuminate\Database\Seeder;

/**
 * Contenido de ejemplo para la página pública. Liz lo reemplaza desde el panel.
 */
class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedBanners();
        $this->seedServices();
        $this->seedEvents();
        $this->seedGallery();
    }

    private function seedBanners(): void
    {
        $banners = [
            ['title' => '¿Tu hijo se está quedando atrás?', 'subtitle' => 'Clases de regularización personalizadas para primaria y secundaria.', 'cta_label' => '¡Agenda su clase!'],
            ['title' => 'Curso de verano 2026', 'subtitle' => 'Manualidades, lectura y juegos para aprender divirtiéndose. ¡Cupo limitado!', 'cta_label' => 'Quiero informes'],
            ['title' => 'Talleres de manualidades', 'subtitle' => 'Creatividad, motricidad fina y mucha diversión cada sábado.', 'cta_label' => 'Ver talleres', 'cta_url' => '#servicios'],
        ];

        foreach ($banners as $i => $banner) {
            Banner::create([
                ...$banner,
                'image_path' => PlaceholderImage::make('banners', $banner['title'], $i, 1600, 700),
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
    }

    private function seedServices(): void
    {
        $services = [
            [
                'title' => 'Regularización de primaria',
                'category' => ServiceCategory::Regularization,
                'short_description' => 'Reforzamos matemáticas, español y tareas con un plan a la medida de cada niño.',
                'description' => "Detectamos en qué temas necesita apoyo y avanzamos a su ritmo.\nIncluye seguimiento con los papás y material de práctica.",
                'age_min' => 6, 'age_max' => 12, 'modality' => Modality::Hybrid,
                'price' => 250, 'price_note' => 'por sesión de 1 hora', 'show_price' => true, 'is_featured' => true,
            ],
            [
                'title' => 'Regularización de secundaria',
                'category' => ServiceCategory::Regularization,
                'short_description' => 'Apoyo en matemáticas, álgebra y preparación para exámenes.',
                'age_min' => 12, 'age_max' => 15, 'modality' => Modality::Hybrid,
                'price' => 280, 'price_note' => 'por sesión de 1 hora', 'show_price' => true,
            ],
            [
                'title' => 'Lectoescritura',
                'category' => ServiceCategory::Regularization,
                'short_description' => 'Aprender a leer y escribir con juegos, cuentos y mucha paciencia.',
                'age_min' => 4, 'age_max' => 7, 'modality' => Modality::InPerson,
                'price' => 230, 'price_note' => 'por sesión', 'show_price' => false, 'is_featured' => true,
            ],
            [
                'title' => 'Taller de manualidades',
                'category' => ServiceCategory::Workshop,
                'short_description' => 'Pintura, recortes y reciclaje para desarrollar creatividad y motricidad fina.',
                'age_min' => 4, 'age_max' => 10, 'modality' => Modality::InPerson,
                'price' => 180, 'price_note' => 'por taller, material incluido', 'show_price' => true,
            ],
            [
                'title' => 'Taller de hábitos de estudio',
                'category' => ServiceCategory::Workshop,
                'short_description' => 'Técnicas sencillas para organizarse, concentrarse y hacer la tarea sin pleitos.',
                'age_min' => 8, 'age_max' => 13, 'modality' => Modality::Online,
                'show_price' => false,
            ],
            [
                'title' => 'Curso de verano "Mentes Brillantes"',
                'category' => ServiceCategory::SummerCourse,
                'short_description' => 'Cuatro semanas de actividades, lectura, juegos y manualidades.',
                'description' => 'De lunes a viernes de 9:00 a 13:00 h. Incluye material y una muestra final para los papás.',
                'age_min' => 5, 'age_max' => 11, 'modality' => Modality::InPerson,
                'price' => 2800, 'price_note' => 'las 4 semanas', 'show_price' => true, 'is_featured' => true,
            ],
        ];

        foreach ($services as $i => $service) {
            Service::create([
                ...$service,
                'image_path' => PlaceholderImage::make('services', $service['title'], $i),
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
    }

    private function seedEvents(): void
    {
        $events = [
            [
                'title' => '¡Inscripciones abiertas para el curso de verano!',
                'body' => 'Aparta el lugar de tu peque. Cupo limitado a 12 niños para darles atención personalizada.',
                'event_date' => null,
            ],
            [
                'title' => 'Taller navideño de manualidades',
                'body' => 'Haremos adornos y tarjetas navideñas con material reciclado. Trae a tus hijos y ¡a crear!',
                'event_date' => now()->addWeeks(3)->next('Saturday'),
                'event_time' => '10:00',
                'location' => 'Mentes Brillantes',
            ],
            [
                'title' => 'Preparación para exámenes finales',
                'body' => 'Sesiones intensivas de repaso de matemáticas y español antes de los exámenes del trimestre.',
                'event_date' => now()->addWeek()->startOfWeek(),
                'event_time' => '16:00',
            ],
            [
                'title' => 'Muestra de fin de curso',
                'body' => 'Los niños presentaron lo que aprendieron durante el trimestre. ¡Gracias a todas las familias!',
                'event_date' => now()->subWeeks(2),
                'event_time' => '17:00',
            ],
        ];

        foreach ($events as $i => $event) {
            Event::create([
                ...$event,
                'image_path' => PlaceholderImage::make('events', $event['title'], $i + 2),
                'is_published' => true,
            ]);
        }
    }

    private function seedGallery(): void
    {
        $captions = [
            'Aprendiendo fracciones con pizza de papel 🍕',
            'Nuestro primer libro de cuentos hecho a mano',
            'Manualidades con material reciclado',
            'Juegos de lectura en voz alta',
            'Día de experimentos en el curso de verano',
            'Practicando las tablas con memorama',
            'Pintando el arcoíris de Mentes Brillantes 🌈',
            'Entrega de reconocimientos',
        ];

        foreach ($captions as $i => $caption) {
            GalleryItem::create([
                'image_path' => PlaceholderImage::make('gallery', $caption, $i, 900, 900),
                'caption' => $caption,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
    }
}
