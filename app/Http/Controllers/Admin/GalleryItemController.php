<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GalleryItemRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Resources\GalleryItemResource;
use App\Models\GalleryItem;
use App\Services\Content\GalleryService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GalleryItemController extends Controller
{
    public function __construct(private GalleryService $gallery) {}

    public function index(): Response
    {
        return Inertia::render('admin/gallery/index', [
            'items' => GalleryItemResource::collection(GalleryItem::query()->ordered()->get()),
        ]);
    }

    public function store(GalleryItemRequest $request): RedirectResponse
    {
        $items = $this->gallery->createMany($request->file('images', []), $request->validated('caption'));

        $message = $items->count() === 1 ? 'Foto agregada 📸' : "{$items->count()} fotos agregadas 📸";

        return back()->with('success', $message);
    }

    public function update(GalleryItemRequest $request, GalleryItem $galleryItem): RedirectResponse
    {
        $this->gallery->update($galleryItem, $request->validated(), $request->file('image'));

        return back()->with('success', 'Foto actualizada.');
    }

    public function toggle(GalleryItem $galleryItem): RedirectResponse
    {
        $this->gallery->toggle($galleryItem);

        return back()->with('success', $galleryItem->is_active ? 'La foto ya se muestra en la página.' : 'La foto quedó oculta.');
    }

    public function reorder(ReorderRequest $request): RedirectResponse
    {
        $this->gallery->reorder($request->ids());

        return back()->with('success', 'Orden guardado.');
    }

    public function destroy(GalleryItem $galleryItem): RedirectResponse
    {
        $this->gallery->delete($galleryItem);

        return back()->with('success', 'Foto eliminada.');
    }
}
