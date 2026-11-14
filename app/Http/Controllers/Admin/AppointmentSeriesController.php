<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Appointments\CreateAppointmentSeries;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AppointmentSeriesRequest;
use App\Http\Resources\AppointmentSeriesResource;
use App\Models\AppointmentSeries;
use App\Services\AppointmentService;
use Illuminate\Http\RedirectResponse;

/**
 * Clases recurrentes (ej. "lunes y miércoles, 10 sesiones").
 */
class AppointmentSeriesController extends Controller
{
    public function __construct(private AppointmentService $appointments) {}

    public function store(AppointmentSeriesRequest $request, CreateAppointmentSeries $createSeries): RedirectResponse
    {
        $series = $createSeries->handle($request->validated());
        $count = $series->appointments->count();

        if ($count === 0) {
            $this->appointments->deleteSeries($series);

            return back()->with('error', 'Con esos días y fechas no cae ninguna clase. Revisa los días de la semana o la fecha final.');
        }

        $summary = (new AppointmentSeriesResource($series))->toArray($request)['summary'];

        return back()->with('success', "¡Listo! Se agendaron {$count} clases ({$summary}) 📅");
    }

    /**
     * Cancela las clases que faltan (las que ya pasaron se quedan en el historial).
     */
    public function cancelRemaining(AppointmentSeries $series): RedirectResponse
    {
        $count = $this->appointments->cancelRemaining($series);

        return back()->with('success', $count === 1 ? 'Se canceló 1 clase.' : "Se cancelaron {$count} clases.");
    }

    public function destroy(AppointmentSeries $series): RedirectResponse
    {
        $this->appointments->deleteSeries($series);

        return back()->with('success', 'Se quitaron de la agenda las clases que faltaban de esa serie.');
    }
}
