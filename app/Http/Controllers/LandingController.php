<?php

namespace App\Http\Controllers;

use App\Enums\ServiceCategory;
use App\Http\Resources\BannerResource;
use App\Http\Resources\EventResource;
use App\Http\Resources\GalleryItemResource;
use App\Http\Resources\ServiceResource;
use App\Models\Banner;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\Service;
use App\Support\WhatsAppLink;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Página pública de Mentes Brillantes.
 */
class LandingController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('landing', [
            'banners' => BannerResource::collection(Banner::query()->active()->ordered()->get()),
            'services' => Service::query()->active()->ordered()->get()
                ->map(fn (Service $s) => (new ServiceResource($s))->forPublic()),
            'categories' => ServiceCategory::options(),
            'events' => EventResource::collection(Event::query()->published()->upcoming()->limit(6)->get()),
            'gallery' => GalleryItemResource::collection(GalleryItem::query()->active()->ordered()->limit(24)->get()),
            'contactUrl' => WhatsAppLink::contact(),
        ]);
    }
}
