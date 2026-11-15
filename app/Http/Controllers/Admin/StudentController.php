<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AppointmentStatus;
use App\Enums\SchoolGrade;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StudentRequest;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\AppointmentSeriesResource;
use App\Http\Resources\GuardianResource;
use App\Http\Resources\StudentResource;
use App\Models\Guardian;
use App\Models\Service;
use App\Models\Student;
use App\Models\Teacher;
use App\Services\StudentService;
use App\Support\SiteConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function __construct(private StudentService $students) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q'));
        $status = $request->query('status', 'active'); // active | inactive | all

        $students = Student::query()
            ->with(['guardian', 'nextAppointment.service'])
            ->withCount('upcomingAppointments')
            ->when($status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->when($search !== '', fn ($q) => $q->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhereHas('guardian', fn ($g) => $g
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('whatsapp_phone', 'like', "%{$search}%"))))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/students/index', [
            'students' => StudentResource::collection($students),
            'filters' => ['q' => $search, 'status' => $status],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/students/form', [
            'student' => null,
            ...$this->formOptions(),
        ]);
    }

    public function store(StudentRequest $request): RedirectResponse
    {
        $student = $this->students->create(
            $request->studentData(),
            $request->integer('guardian_id') ?: null,
            $request->newGuardianData(),
        );

        return to_route('admin.students.show', $student)->with('success', "¡{$student->firstName()} quedó registrado! 🎉");
    }

    public function show(Student $student): Response
    {
        $student->load('guardian.students');

        return Inertia::render('admin/students/show', [
            'student' => new StudentResource($student),
            'upcoming' => AppointmentResource::collection(
                $student->appointments()->with(['service', 'teacher', 'student.guardian'])
                    ->where('starts_at', '>=', now()->startOfDay())->orderBy('starts_at')->limit(30)->get(),
            ),
            'history' => AppointmentResource::collection(
                $student->appointments()->with(['service', 'teacher'])
                    ->where('starts_at', '<', now()->startOfDay())->orderByDesc('starts_at')->limit(30)->get(),
            ),
            'series' => AppointmentSeriesResource::collection(
                $student->appointmentSeries()->withCount(['appointments', 'remainingAppointments'])->latest()->get(),
            ),
            // Para los diálogos de "agendar clase" de esta ficha
            'studentOptions' => [['id' => $student->id, 'name' => $student->name, 'guardian' => $student->guardian?->name]],
            'services' => Service::query()->active()->orderBy('title')->get(['id', 'title'])
                ->map(fn (Service $s) => ['id' => $s->id, 'title' => $s->title]),
            'statuses' => AppointmentStatus::options(),
            'teachers' => SiteConfig::multiTeacher()
                ? Teacher::query()->active()->ordered()->get(['id', 'name', 'color'])
                    ->map(fn (Teacher $t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color])
                : [],
        ]);
    }

    public function edit(Student $student): Response
    {
        return Inertia::render('admin/students/form', [
            'student' => new StudentResource($student->load('guardian')),
            ...$this->formOptions(),
        ]);
    }

    public function update(StudentRequest $request, Student $student): RedirectResponse
    {
        $this->students->update(
            $student,
            $request->studentData(),
            $request->integer('guardian_id') ?: null,
            $request->newGuardianData(),
        );

        return to_route('admin.students.show', $student)->with('success', 'Datos actualizados.');
    }

    public function destroy(Student $student): RedirectResponse
    {
        $name = $student->firstName();
        $this->students->delete($student);

        return to_route('admin.students.index')->with('success', "Se eliminó a {$name} y sus clases.");
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'grades' => SchoolGrade::options(),
            'guardians' => GuardianResource::collection(Guardian::query()->orderBy('name')->get()),
        ];
    }
}
