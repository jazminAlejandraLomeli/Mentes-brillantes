<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\EventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\Content\EventService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function __construct(private EventService $events) {}

    public function index(): Response
    {
        // Próximos primero (los sin fecha al inicio), luego los que ya pasaron
        $events = Event::query()
            ->orderByRaw('case when event_date is null then 0 when event_date >= ? then 1 else 2 end', [today()->toDateString()])
            ->orderByRaw('case when event_date >= ? then event_date end asc', [today()->toDateString()])
            ->orderByDesc('event_date')
            ->get();

        return Inertia::render('admin/events/index', [
            'events' => EventResource::collection($events),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/events/form', ['event' => null]);
    }

    public function store(EventRequest $request): RedirectResponse
    {
        $this->events->create($request->validated(), $request->file('image'));

        return to_route('admin.events.index')->with('success', 'Aviso publicado 🎉');
    }

    public function edit(Event $event): Response
    {
        return Inertia::render('admin/events/form', ['event' => new EventResource($event)]);
    }

    public function update(EventRequest $request, Event $event): RedirectResponse
    {
        $this->events->update($event, $request->validated(), $request->file('image'), $request->boolean('remove_image'));

        return to_route('admin.events.index')->with('success', 'Aviso actualizado.');
    }

    public function toggle(Event $event): RedirectResponse
    {
        $this->events->toggle($event);

        return back()->with('success', $event->is_published ? 'El aviso ya se muestra en la página.' : 'El aviso quedó oculto.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $this->events->delete($event);

        return to_route('admin.events.index')->with('success', 'Aviso eliminado.');
    }
}
