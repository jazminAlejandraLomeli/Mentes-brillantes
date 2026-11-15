<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderRequest;
use App\Http\Requests\Admin\TeacherRequest;
use App\Http\Resources\TeacherResource;
use App\Models\Teacher;
use App\Services\TeacherService;
use App\Support\SiteConfig;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Maestros: su perfil en la página y, en salones con varios maestros,
 * a quién se le asigna cada clase.
 */
class TeacherController extends Controller
{
    /** Colores pastel sugeridos para distinguir a cada maestro en la agenda */
    public const COLORS = ['#F784B0', '#4BBBE5', '#EBA81F', '#87D068', '#C9A0D3', '#F7A38B', '#7EB8E8', '#7FCFB0'];

    public function __construct(private TeacherService $teachers) {}

    public function index(): Response
    {
        return Inertia::render('admin/teachers/index', [
            'teachers' => TeacherResource::collection(
                Teacher::query()->withCount('upcomingAppointments')->ordered()->get(),
            ),
        ]);
    }

    public function create(): Response
    {
        $used = Teacher::query()->pluck('color')->all();

        return Inertia::render('admin/teachers/form', [
            'teacher' => null,
            'colors' => self::COLORS,
            // Para uno nuevo, sugiere un color que nadie use
            'suggestedColor' => collect(self::COLORS)->first(fn ($c) => ! in_array($c, $used, true)) ?? self::COLORS[0],
        ]);
    }

    public function store(TeacherRequest $request): RedirectResponse
    {
        $teacher = $this->teachers->create($request->teacherData(), $request->file('photo'));

        return to_route('admin.teachers.index')->with('success', "¡{$teacher->name} ya forma parte del equipo! 🎉");
    }

    public function edit(Teacher $teacher): Response
    {
        return Inertia::render('admin/teachers/form', [
            'teacher' => new TeacherResource($teacher),
            'colors' => self::COLORS,
            'suggestedColor' => $teacher->color,
        ]);
    }

    public function update(TeacherRequest $request, Teacher $teacher): RedirectResponse
    {
        $this->teachers->update($teacher, $request->teacherData(), $request->file('photo'), $request->boolean('remove_photo'));

        return to_route('admin.teachers.index')->with('success', 'Datos del maestro actualizados.');
    }

    /**
     * Disponible / no disponible para agendar (salones con varios maestros).
     */
    public function toggle(Teacher $teacher): RedirectResponse
    {
        $teacher->update(['is_active' => ! $teacher->is_active]);

        return back()->with('success', $teacher->is_active ? 'Ya aparece al agendar.' : 'Ya no aparece al agendar (sus clases se conservan).');
    }

    public function toggleWebsite(Teacher $teacher): RedirectResponse
    {
        $teacher->update(['show_on_website' => ! $teacher->show_on_website]);

        return back()->with('success', $teacher->show_on_website ? 'Su perfil ya se ve en la página.' : 'Su perfil quedó oculto en la página.');
    }

    public function reorder(ReorderRequest $request): RedirectResponse
    {
        $this->teachers->reorder($request->ids());

        return back()->with('success', 'Orden guardado.');
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        $name = $teacher->name;
        $this->teachers->delete($teacher);

        $message = SiteConfig::multiTeacher()
            ? "Se eliminó a {$name}. Sus clases se quedaron en la agenda sin maestro asignado."
            : "Se eliminó a {$name}.";

        return to_route('admin.teachers.index')->with('success', $message);
    }
}
