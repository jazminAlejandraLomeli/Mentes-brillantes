<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BannerRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use App\Services\Content\BannerService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    public function __construct(private BannerService $banners) {}

    public function index(): Response
    {
        return Inertia::render('admin/banners/index', [
            'banners' => BannerResource::collection(Banner::query()->ordered()->get()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/banners/form', ['banner' => null]);
    }

    public function store(BannerRequest $request): RedirectResponse
    {
        $this->banners->create($request->safe()->except('image'), $request->file('image'));

        return to_route('admin.banners.index')->with('success', 'Banner creado 🎉');
    }

    public function edit(Banner $banner): Response
    {
        return Inertia::render('admin/banners/form', ['banner' => new BannerResource($banner)]);
    }

    public function update(BannerRequest $request, Banner $banner): RedirectResponse
    {
        $this->banners->update($banner, $request->safe()->except('image'), $request->file('image'));

        return to_route('admin.banners.index')->with('success', 'Banner actualizado.');
    }

    public function toggle(Banner $banner): RedirectResponse
    {
        $this->banners->toggle($banner);

        return back()->with('success', $banner->is_active ? 'El banner ya se muestra en la página.' : 'El banner quedó oculto.');
    }

    public function reorder(ReorderRequest $request): RedirectResponse
    {
        $this->banners->reorder($request->ids());

        return back()->with('success', 'Orden guardado.');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $this->banners->delete($banner);

        return to_route('admin.banners.index')->with('success', 'Banner eliminado.');
    }
}
