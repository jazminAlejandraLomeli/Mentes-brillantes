<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Banner;
use App\Models\Event;
use App\Models\Service;
use App\Models\Student;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inicio del panel: lo que Liz necesita ver al abrirlo.
 */
class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $withRelations = fn ($q) => $q->with(['student.guardian', 'service'])->orderBy('starts_at');

        $today = $withRelations(Appointment::query()->onDate(today())->where('status', '!=', AppointmentStatus::Cancelled))->get();
        $tomorrow = $withRelations(Appointment::query()->onDate(today()->addDay())->where('status', '!=', AppointmentStatus::Cancelled))->get();

        // Clases de las próximas 48 h a las que todavía no se les manda recordatorio
        $needReminder = $withRelations(Appointment::query()
            ->active()
            ->whereNull('reminder_sent_at')
            ->whereBetween('starts_at', [now(), now()->addHours(48)]))
            ->get();

        return Inertia::render('admin/dashboard', [
            'today' => AppointmentResource::collection($today),
            'tomorrow' => AppointmentResource::collection($tomorrow),
            'needReminder' => AppointmentResource::collection($needReminder),
            'stats' => [
                'active_students' => Student::query()->active()->count(),
                'classes_this_week' => Appointment::query()->active()
                    ->whereBetween('starts_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'pending_confirmation' => Appointment::query()->where('status', AppointmentStatus::Pending)
                    ->where('starts_at', '>=', now())->count(),
                'active_services' => Service::query()->active()->count(),
                'active_banners' => Banner::query()->active()->count(),
                'upcoming_events' => Event::query()->published()->upcoming()->count(),
            ],
        ]);
    }
}
