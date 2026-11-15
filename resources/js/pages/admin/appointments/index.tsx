import { AppointmentDetail } from '@/components/admin/appointment-detail';
import { AppointmentDialog, SeriesDialog } from '@/components/admin/appointment-dialogs';
import { AppointmentList, AppointmentRow } from '@/components/admin/appointment-row';
import { EmptyState } from '@/components/admin/empty-state';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { statusDot } from '@/components/admin/status-badge';
import { StudentSearch } from '@/components/admin/student-search';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import AppLayout from '@/layouts/app-layout';
import { addDays, addMonths, daysBetween, formatDay, parseISODate, todayString } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { type Appointment, type ServiceOption, type StatusOption, type StudentOption, type TeacherOption } from '@/types/admin';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarPlus, ChevronLeft, ChevronRight, Plus, Repeat } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type View = 'week' | 'month' | 'list';

interface Props {
    appointments: Appointment[];
    view: View;
    date: string;
    range: { from: string; to: string };
    filters: { status: string | null; student_id: number | null; teacher_id: number | null };
    students: StudentOption[];
    services: ServiceOption[];
    statuses: StatusOption[];
    /** Vacío si el salón tiene una sola maestra */
    teachers: TeacherOption[];
}

const VIEWS: { value: View; label: string }[] = [
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'list', label: 'Lista' },
];

export default function AppointmentsIndex({ appointments, view, date, range, filters, students, services, statuses, teachers }: Props) {
    const [creating, setCreating] = useState<{ date?: string } | null>(null);
    const [seriesOpen, setSeriesOpen] = useState(false);
    const [selected, setSelected] = useState<Appointment | null>(null);
    const [editing, setEditing] = useState<Appointment | null>(null);

    // Desde el inicio se llega con ?new=1 para abrir "Agendar clase" directo
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('new')) setCreating({});
    }, []);

    // Si la clase seleccionada cambió (ej. después de marcarla), usa los datos nuevos
    useEffect(() => {
        if (selected) setSelected(appointments.find((a) => a.id === selected.id) ?? null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appointments]);

    const go = (params: Partial<{ view: View; date: string; status: string | null; student_id: number | null; teacher_id: number | null }>) =>
        router.get(
            route('admin.appointments.index'),
            {
                view: params.view ?? view,
                date: params.date ?? date,
                status: (params.status !== undefined ? params.status : filters.status) || undefined,
                student_id: (params.student_id !== undefined ? params.student_id : filters.student_id) || undefined,
                teacher_id: (params.teacher_id !== undefined ? params.teacher_id : filters.teacher_id) || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    const filteredStudent = students.find((s) => s.id === filters.student_id) ?? null;

    const step = (dir: 1 | -1) => go({ date: view === 'month' ? addMonths(date, dir) : addDays(date, view === 'week' ? 7 * dir : 30 * dir) });

    const byDay = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        appointments.forEach((a) => (map[a.date] ??= []).push(a));
        return map;
    }, [appointments]);

    const title =
        view === 'month'
            ? formatDay(date, { month: 'long', year: 'numeric' })
            : view === 'week'
              ? `${formatDay(range.from, { day: 'numeric', month: 'short' })} – ${formatDay(range.to, { day: 'numeric', month: 'short', year: 'numeric' })}`
              : `Desde ${formatDay(range.from, { day: 'numeric', month: 'long' })}`;

    const openAppointment = (a: Appointment) => setSelected(a);

    return (
        <AppLayout breadcrumbs={[{ title: 'Agenda', href: route('admin.appointments.index') }]}>
            <Head title="Agenda" />
            <PageBody>
                <PageHeader
                    title="Agenda"
                    description="Da clic en una clase para confirmarla, moverla o mandar WhatsApp."
                    actions={
                        <>
                            <Button variant="outline" className="rounded-full" onClick={() => setSeriesOpen(true)}>
                                <Repeat /> Clases recurrentes
                            </Button>
                            <Button className="rounded-full" onClick={() => setCreating({})}>
                                <CalendarPlus /> Agendar clase
                            </Button>
                        </>
                    }
                />

                {/* Barra de navegación */}
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => step(-1)} aria-label="Anterior">
                            <ChevronLeft />
                        </Button>
                        <Button variant="outline" onClick={() => go({ date: todayString() })}>
                            Hoy
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => step(1)} aria-label="Siguiente">
                            <ChevronRight />
                        </Button>
                        <h2 className="font-heading ml-2 text-lg font-bold whitespace-nowrap first-letter:uppercase">{title}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <StudentSearch students={students} selectedId={filters.student_id} onSelect={(id) => go({ student_id: id })} />
                        {teachers.length > 0 && (
                            <NativeSelect
                                aria-label="Filtrar por maestro"
                                value={filters.teacher_id ?? ''}
                                onChange={(e) => go({ teacher_id: e.target.value ? Number(e.target.value) : null })}
                                className="h-9 w-44"
                            >
                                <option value="">Todos los maestros</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        )}
                        <NativeSelect
                            aria-label="Filtrar por estado"
                            value={filters.status ?? ''}
                            onChange={(e) => go({ status: e.target.value || null })}
                            className="h-9 w-40"
                        >
                            <option value="">Todos los estados</option>
                            {statuses.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </NativeSelect>
                        <div className="bg-muted flex rounded-lg p-1" role="tablist" aria-label="Vista">
                            {VIEWS.map((v) => (
                                <button
                                    key={v.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={view === v.value}
                                    onClick={() => go({ view: v.value })}
                                    className={cn(
                                        'rounded-md px-3 py-1 text-sm font-semibold transition',
                                        view === v.value ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {filteredStudent && (
                    <div className="bg-primary/5 border-primary/20 flex flex-col gap-2 rounded-2xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            Solo las clases de <strong>{filteredStudent.name}</strong>
                            {' · '}
                            {appointments.length === 0
                                ? 'no tiene clases en estas fechas'
                                : `${appointments.length} ${appointments.length === 1 ? 'clase' : 'clases'} en estas fechas`}
                        </p>
                        <div className="flex flex-wrap gap-3 font-semibold">
                            {view !== 'list' && (
                                <button
                                    type="button"
                                    onClick={() => go({ view: 'list', date: todayString() })}
                                    className="text-primary hover:underline"
                                >
                                    Ver sus próximas clases
                                </button>
                            )}
                            <Link href={route('admin.students.show', filteredStudent.id)} className="text-primary hover:underline">
                                Ver su ficha
                            </Link>
                            <button type="button" onClick={() => go({ student_id: null })} className="text-muted-foreground hover:underline">
                                Ver a todos
                            </button>
                        </div>
                    </div>
                )}

                {view === 'week' && <WeekView range={range} byDay={byDay} onOpen={openAppointment} onCreate={(d) => setCreating({ date: d })} />}
                {view === 'month' && (
                    <MonthView date={date} range={range} byDay={byDay} onOpen={openAppointment} onDay={(d) => go({ view: 'week', date: d })} />
                )}
                {view === 'list' &&
                    (appointments.length === 0 ? (
                        <EmptyState
                            title={
                                filteredStudent
                                    ? `${filteredStudent.name.split(' ')[0]} no tiene clases en estos 30 días`
                                    : 'No hay clases en estos 30 días'
                            }
                        />
                    ) : (
                        <div className="grid gap-5">
                            {Object.entries(byDay).map(([day, list]) => (
                                <section key={day}>
                                    <h3 className="mb-2 text-sm font-bold first-letter:uppercase">
                                        {formatDay(day, { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </h3>
                                    <AppointmentList>
                                        {list.map((a) => (
                                            <AppointmentRow key={a.id} appointment={a} onClick={() => openAppointment(a)} />
                                        ))}
                                    </AppointmentList>
                                </section>
                            ))}
                        </div>
                    ))}

                <Legend statuses={statuses} />
            </PageBody>

            <AppointmentDetail
                appointment={selected}
                onClose={() => setSelected(null)}
                onEdit={(a) => {
                    setSelected(null);
                    setEditing(a);
                }}
            />
            <AppointmentDialog
                open={creating !== null}
                onOpenChange={(o) => !o && setCreating(null)}
                defaultDate={creating?.date}
                defaultStudentId={filters.student_id ?? undefined}
                defaultTeacherId={filters.teacher_id ?? undefined}
                teachers={teachers}
                students={students}
                services={services}
            />
            <AppointmentDialog
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
                appointment={editing}
                teachers={teachers}
                students={students}
                services={services}
                statuses={statuses}
            />
            <SeriesDialog
                open={seriesOpen}
                onOpenChange={setSeriesOpen}
                defaultStudentId={filters.student_id ?? undefined}
                defaultTeacherId={filters.teacher_id ?? undefined}
                teachers={teachers}
                students={students}
                services={services}
            />
        </AppLayout>
    );
}

// --- Vistas ---

function WeekView({
    range,
    byDay,
    onOpen,
    onCreate,
}: {
    range: { from: string; to: string };
    byDay: Record<string, Appointment[]>;
    onOpen: (a: Appointment) => void;
    onCreate: (date: string) => void;
}) {
    const today = todayString();

    return (
        <div className="grid gap-3 md:grid-cols-7 md:gap-2">
            {daysBetween(range.from, range.to).map((day) => {
                const list = byDay[day] ?? [];
                const isToday = day === today;

                return (
                    <section
                        key={day}
                        className={cn(
                            'bg-card flex min-h-28 flex-col rounded-2xl border p-2 shadow-sm md:min-h-64',
                            isToday && 'border-primary ring-primary/20 ring-2',
                        )}
                    >
                        <header className="mb-2 flex items-center justify-between px-1">
                            <span className={cn('text-sm font-bold first-letter:uppercase', isToday && 'text-primary')}>
                                {formatDay(day, { weekday: 'short' })}{' '}
                                <span className="text-muted-foreground font-semibold">{parseISODate(day).getDate()}</span>
                            </span>
                            <button
                                type="button"
                                onClick={() => onCreate(day)}
                                aria-label={`Agendar el ${formatDay(day, { weekday: 'long', day: 'numeric' })}`}
                                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-1"
                            >
                                <Plus className="size-4" />
                            </button>
                        </header>
                        <div className="grid gap-1.5">
                            {list.map((a) => (
                                <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => onOpen(a)}
                                    className={cn(
                                        'bg-muted/60 hover:bg-accent rounded-lg border-l-4 px-2 py-1.5 text-left text-xs transition',
                                        a.status === 'pending' && 'border-amber-400',
                                        a.status === 'confirmed' && 'border-sky-500',
                                        a.status === 'completed' && 'border-emerald-500',
                                        a.status === 'cancelled' && 'border-rose-300 line-through opacity-60',
                                    )}
                                >
                                    <span className="block font-bold">{a.time_label.split(' – ')[0]}</span>
                                    <span className="block truncate font-semibold">{a.student?.name.split(' ').slice(0, 2).join(' ')}</span>
                                    <span className="text-muted-foreground block truncate">{a.topic}</span>
                                    {a.teacher && (
                                        <span className="mt-0.5 flex items-center gap-1 truncate font-semibold">
                                            <span className="size-2 shrink-0 rounded-full" style={{ background: a.teacher.color }} />
                                            {a.teacher.name}
                                        </span>
                                    )}
                                </button>
                            ))}
                            {list.length === 0 && <p className="text-muted-foreground px-1 text-xs md:hidden">Sin clases</p>}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

function MonthView({
    date,
    range,
    byDay,
    onOpen,
    onDay,
}: {
    date: string;
    range: { from: string; to: string };
    byDay: Record<string, Appointment[]>;
    onOpen: (a: Appointment) => void;
    onDay: (date: string) => void;
}) {
    const month = parseISODate(date).getMonth();
    const today = todayString();
    const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return (
        <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="text-muted-foreground grid grid-cols-7 border-b text-center text-xs font-bold">
                {weekdays.map((d) => (
                    <div key={d} className="py-2">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {daysBetween(range.from, range.to).map((day) => {
                    const list = byDay[day] ?? [];
                    const outside = parseISODate(day).getMonth() !== month;

                    return (
                        <div key={day} className={cn('min-h-20 border-r border-b p-1 sm:min-h-28', outside && 'bg-muted/40')}>
                            <button
                                type="button"
                                onClick={() => onDay(day)}
                                className={cn(
                                    'mb-1 flex size-6 items-center justify-center rounded-full text-xs font-bold',
                                    day === today ? 'bg-primary text-primary-foreground' : outside ? 'text-muted-foreground' : 'hover:bg-accent',
                                )}
                                aria-label={`Ver la semana del ${formatDay(day, { day: 'numeric', month: 'long' })}`}
                            >
                                {parseISODate(day).getDate()}
                            </button>
                            {/* En celular solo puntitos; en pantalla grande, nombres */}
                            <div className="flex flex-wrap gap-0.5 sm:hidden">
                                {list.map((a) => (
                                    <span key={a.id} className={cn('size-1.5 rounded-full', statusDot[a.status])} />
                                ))}
                            </div>
                            <div className="hidden gap-0.5 sm:grid">
                                {list.slice(0, 3).map((a) => (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => onOpen(a)}
                                        className={cn(
                                            'hover:bg-accent flex items-center gap-1 truncate rounded px-1 text-left text-[0.7rem]',
                                            a.status === 'cancelled' && 'line-through opacity-50',
                                        )}
                                        // En salones con varios maestros, cada clase lleva el color de su maestro
                                        style={a.teacher ? { background: `${a.teacher.color}26` } : undefined}
                                        title={a.teacher ? `${a.teacher.name} · ${a.status_label}` : a.status_label}
                                    >
                                        <span className={cn('size-1.5 shrink-0 rounded-full', statusDot[a.status])} />
                                        <span className="font-semibold">{a.time}</span>
                                        <span className="truncate">{a.student?.name.split(' ')[0]}</span>
                                    </button>
                                ))}
                                {list.length > 3 && (
                                    <button
                                        type="button"
                                        onClick={() => onDay(day)}
                                        className="text-muted-foreground px-1 text-left text-[0.7rem] hover:underline"
                                    >
                                        +{list.length - 3} más
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Legend({ statuses }: { statuses: StatusOption[] }) {
    return (
        <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
            {statuses.map((s) => (
                <span key={s.value} className="inline-flex items-center gap-1.5">
                    <span className={cn('size-2.5 rounded-full', statusDot[s.value])} /> {s.label}
                </span>
            ))}
        </div>
    );
}
