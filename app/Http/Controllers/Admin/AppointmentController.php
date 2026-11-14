<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AppointmentRequest;
use App\Http\Requests\Admin\AppointmentStatusRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\Student;
use App\Services\AppointmentService;
use App\Support\WhatsAppLink;
use App\Support\WhatsAppTemplates;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    private const VIEWS = ['week', 'month', 'list'];

    public function __construct(private AppointmentService $appointments) {}

    /**
     * Agenda en vista semana, mes o lista.
     */
    public function index(Request $request): Response
    {
        $view = in_array($request->query('view'), self::VIEWS, true) ? $request->query('view') : 'week';
        $date = $this->parseDate($request->query('date'));
        $status = AppointmentStatus::tryFrom((string) $request->query('status'));
        $studentId = $request->integer('student_id') ?: null;

        [$from, $to] = match ($view) {
            'month' => [$date->copy()->startOfMonth()->startOfWeek(), $date->copy()->endOfMonth()->endOfWeek()],
            'list' => [$date->copy()->startOfDay(), $date->copy()->addDays(30)->endOfDay()],
            default => [$date->copy()->startOfWeek(), $date->copy()->endOfWeek()],
        };

        $appointments = Appointment::query()
            ->with(['student.guardian', 'service'])
            ->whereBetween('starts_at', [$from, $to])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($studentId, fn ($q) => $q->where('student_id', $studentId))
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('admin/appointments/index', [
            'appointments' => AppointmentResource::collection($appointments),
            'view' => $view,
            'date' => $date->toDateString(),
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'filters' => ['status' => $status?->value, 'student_id' => $studentId],
            ...$this->formOptions(),
        ]);
    }

    public function store(AppointmentRequest $request): RedirectResponse
    {
        $data = $request->appointmentData();
        $conflicts = $this->appointments->conflicts($data['starts_at'], $data['duration_minutes']);
        $appointment = $this->appointments->schedule($data);

        return back()
            ->with('success', 'Clase agendada para el '.WhatsAppLink::formatDate($appointment->starts_at).' 📅')
            ->with('warning', $this->conflictWarning($conflicts))
            ->with('whatsapp', [
                'label' => 'Enviar confirmación por WhatsApp',
                'url' => WhatsAppLink::forAppointment($appointment, WhatsAppTemplates::REMINDER),
                'appointment_id' => $appointment->id,
            ]);
    }

    public function update(AppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $data = $request->appointmentData();
        $conflicts = $this->appointments->conflicts($data['starts_at'], $data['duration_minutes'], $appointment->id);
        $moved = $this->appointments->update($appointment, $data);

        $response = back()
            ->with('success', $moved ? 'Clase reagendada.' : 'Clase actualizada.')
            ->with('warning', $this->conflictWarning($conflicts));

        // Si se movió, ofrece avisar a la familia del nuevo horario
        return $moved
            ? $response->with('whatsapp', [
                'label' => 'Avisar del nuevo horario por WhatsApp',
                'url' => WhatsAppLink::forAppointment($appointment->fresh(), WhatsAppTemplates::RESCHEDULE),
                'appointment_id' => $appointment->id,
            ])
            : $response;
    }

    public function updateStatus(AppointmentStatusRequest $request, Appointment $appointment): RedirectResponse
    {
        $status = $request->status();
        $this->appointments->changeStatus($appointment, $status);

        $response = back()->with('success', "Clase marcada como «{$status->label()}».");

        return $status === AppointmentStatus::Cancelled
            ? $response->with('whatsapp', [
                'label' => 'Avisar la cancelación por WhatsApp',
                'url' => WhatsAppLink::forAppointment($appointment, WhatsAppTemplates::CANCELLATION),
                'appointment_id' => $appointment->id,
            ])
            : $response;
    }

    /**
     * Se llama al dar clic en "Enviar recordatorio" (el navegador abre WhatsApp).
     */
    public function markReminderSent(Appointment $appointment): RedirectResponse
    {
        $this->appointments->markReminderSent($appointment);

        return back();
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        $this->appointments->delete($appointment);

        return back()->with('success', 'Clase eliminada de la agenda.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'students' => Student::query()->active()->with('guardian:id,name')->orderBy('name')->get(['id', 'name', 'guardian_id'])
                ->map(fn (Student $s) => ['id' => $s->id, 'name' => $s->name, 'guardian' => $s->guardian?->name]),
            'services' => Service::query()->active()->orderBy('title')->get(['id', 'title'])
                ->map(fn (Service $s) => ['id' => $s->id, 'title' => $s->title]),
            'statuses' => AppointmentStatus::options(),
        ];
    }

    private function parseDate(mixed $value): Carbon
    {
        try {
            return is_string($value) && $value !== '' ? Carbon::createFromFormat('Y-m-d', $value)->startOfDay() : today();
        } catch (\Throwable) {
            return today();
        }
    }

    /**
     * @param  Collection<int, Appointment>  $conflicts
     */
    private function conflictWarning($conflicts): ?string
    {
        if ($conflicts->isEmpty()) {
            return null;
        }

        $names = $conflicts->map(fn (Appointment $a) => $a->student->firstName().' ('.$a->starts_at->format('H:i').')')->implode(', ');

        return "Ojo: a esa hora también tienes clase con {$names}.";
    }
}
