<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LocationRequest;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Services\LocationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Sucursales: dirección, horario y mapa en la sección "Visítanos".
 */
class LocationController extends Controller
{
    public function __construct(private LocationService $locations) {}

    public function index(): Response
    {
        return Inertia::render('admin/locations/index', [
            'locations' => LocationResource::collection(Location::query()->ordered()->get()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/locations/form', ['location' => null]);
    }

    public function store(LocationRequest $request): RedirectResponse
    {
        $this->locations->create($request->validated());

        return to_route('admin.locations.index')->with('success', 'Sucursal agregada 📍');
    }

    public function edit(Location $location): Response
    {
        return Inertia::render('admin/locations/form', ['location' => new LocationResource($location)]);
    }

    public function update(LocationRequest $request, Location $location): RedirectResponse
    {
        $this->locations->update($location, $request->validated());

        return to_route('admin.locations.index')->with('success', 'Sucursal actualizada.');
    }

    public function toggle(Location $location): RedirectResponse
    {
        $this->locations->toggle($location);

        return back()->with('success', $location->is_active ? 'La sucursal ya se muestra en la página.' : 'La sucursal quedó oculta.');
    }

    public function reorder(ReorderRequest $request): RedirectResponse
    {
        $this->locations->reorder($request->ids());

        return back()->with('success', 'Orden guardado.');
    }

    public function destroy(Location $location): RedirectResponse
    {
        $this->locations->delete($location);

        return to_route('admin.locations.index')->with('success', 'Sucursal eliminada.');
    }
}
