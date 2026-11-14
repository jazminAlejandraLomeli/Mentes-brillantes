<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Modality;
use App\Enums\ServiceCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Requests\Admin\ServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Services\Content\ServiceCatalogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function __construct(private ServiceCatalogService $services) {}

    public function index(Request $request): Response
    {
        $category = ServiceCategory::tryFrom((string) $request->query('category'));

        return Inertia::render('admin/services/index', [
            'services' => ServiceResource::collection(
                Service::query()
                    ->when($category, fn ($q) => $q->where('category', $category))
                    ->orderBy('sort_order')->orderBy('title')
                    ->get(),
            ),
            'filters' => ['category' => $category?->value],
            'categories' => ServiceCategory::options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/services/form', [
            'service' => null,
            ...$this->formOptions(),
        ]);
    }

    public function store(ServiceRequest $request): RedirectResponse
    {
        $this->services->create($request->validated(), $request->file('image'));

        return to_route('admin.services.index')->with('success', 'Servicio creado 🎉');
    }

    public function edit(Service $service): Response
    {
        return Inertia::render('admin/services/form', [
            'service' => new ServiceResource($service),
            ...$this->formOptions(),
        ]);
    }

    public function update(ServiceRequest $request, Service $service): RedirectResponse
    {
        $this->services->update($service, $request->validated(), $request->file('image'), $request->boolean('remove_image'));

        return to_route('admin.services.index')->with('success', 'Servicio actualizado.');
    }

    public function toggle(Service $service): RedirectResponse
    {
        $this->services->toggle($service);

        return back()->with('success', $service->is_active ? 'El servicio ya se muestra en la página.' : 'El servicio quedó oculto.');
    }

    public function reorder(ReorderRequest $request): RedirectResponse
    {
        $this->services->reorder($request->ids());

        return back()->with('success', 'Orden guardado.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $this->services->delete($service);

        return to_route('admin.services.index')->with('success', 'Servicio eliminado.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'categories' => ServiceCategory::options(),
            'modalities' => Modality::options(),
        ];
    }
}
