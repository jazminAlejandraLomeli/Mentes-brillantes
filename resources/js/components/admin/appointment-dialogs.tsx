import { FormField } from '@/components/admin/form-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { type Appointment, type ServiceOption, type StatusOption, type StudentOption, type TeacherOption } from '@/types/admin';
import { useForm } from '@inertiajs/react';
import { CalendarPlus, LoaderCircle, Repeat } from 'lucide-react';
import { type FormEventHandler, useEffect, useMemo, useState } from 'react';

const DURATIONS = [30, 45, 60, 90, 120];
const WEEKDAYS = [
    { value: 1, short: 'L', label: 'Lunes' },
    { value: 2, short: 'M', label: 'Martes' },
    { value: 3, short: 'Mi', label: 'Miércoles' },
    { value: 4, short: 'J', label: 'Jueves' },
    { value: 5, short: 'V', label: 'Viernes' },
    { value: 6, short: 'S', label: 'Sábado' },
    { value: 7, short: 'D', label: 'Domingo' },
];

export function todayISO(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Options {
    students: StudentOption[];
    services: ServiceOption[];
    /** Solo en salones con varios maestros; vacío = no se pregunta */
    teachers?: TeacherOption[];
    defaultTeacherId?: number;
    statuses?: StatusOption[];
}

interface AppointmentDialogProps extends Options {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Si viene, se edita esa clase */
    appointment?: Appointment | null;
    defaultStudentId?: number;
    defaultDate?: string;
}

type AppointmentForm = {
    student_id: string;
    teacher_id: string;
    service_id: string;
    subject: string;
    date: string;
    time: string;
    duration_minutes: string;
    status: string;
    notes: string;
};

/** Agendar o editar una clase suelta. */
export function AppointmentDialog({
    open,
    onOpenChange,
    appointment,
    defaultStudentId,
    defaultDate,
    students,
    services,
    statuses,
    teachers = [],
    defaultTeacherId,
}: AppointmentDialogProps) {
    const editing = Boolean(appointment);
    const initial = (): AppointmentForm => ({
        student_id: String(appointment?.student_id ?? defaultStudentId ?? ''),
        teacher_id: String(appointment?.teacher_id ?? defaultTeacherId ?? ''),
        service_id: String(appointment?.service_id ?? ''),
        subject: appointment?.subject ?? '',
        date: appointment?.date ?? defaultDate ?? todayISO(),
        time: appointment?.time ?? '16:00',
        duration_minutes: String(appointment?.duration_minutes ?? 60),
        status: appointment?.status ?? 'pending',
        notes: appointment?.notes ?? '',
    });
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<AppointmentForm>(initial());

    // Al abrir, carga los datos de la clase elegida (o los valores por defecto)
    useEffect(() => {
        if (open) {
            setData(initial());
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, appointment?.id, defaultDate, defaultStudentId]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        };
        if (appointment) {
            put(route('admin.appointments.update', appointment.id), options);
        } else {
            post(route('admin.appointments.store'), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarPlus className="text-primary size-5" /> {editing ? 'Editar clase' : 'Agendar clase'}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? 'Si cambias la fecha u hora, te ofreceremos avisar a la familia por WhatsApp.'
                            : 'Después podrás mandar la confirmación por WhatsApp.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4">
                    <StudentAndTopicFields
                        data={data}
                        setData={setData}
                        errors={errors}
                        students={students}
                        services={services}
                        teachers={teachers}
                    />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <FormField label="Fecha" htmlFor="appt-date" error={errors.date} className="col-span-2 sm:col-span-1">
                            <Input id="appt-date" type="date" value={data.date} onChange={(e) => setData('date', e.target.value)} required />
                        </FormField>
                        <FormField label="Hora" htmlFor="appt-time" error={errors.time}>
                            <Input
                                id="appt-time"
                                type="time"
                                step={300}
                                value={data.time}
                                onChange={(e) => setData('time', e.target.value)}
                                required
                            />
                        </FormField>
                        <FormField label="Duración" htmlFor="appt-duration" error={errors.duration_minutes}>
                            <DurationSelect id="appt-duration" value={data.duration_minutes} onChange={(v) => setData('duration_minutes', v)} />
                        </FormField>
                    </div>
                    {editing && statuses && (
                        <FormField label="Estado" htmlFor="appt-status" error={errors.status}>
                            <NativeSelect id="appt-status" value={data.status} onChange={(e) => setData('status', e.target.value)}>
                                {statuses.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </NativeSelect>
                        </FormField>
                    )}
                    <FormField label="Notas" htmlFor="appt-notes" error={errors.notes} optional>
                        <Textarea
                            id="appt-notes"
                            rows={2}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Ej. traer libro de matemáticas"
                        />
                    </FormField>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="animate-spin" />}
                            {editing ? 'Guardar cambios' : 'Agendar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface SeriesDialogProps extends Options {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultStudentId?: number;
}

type SeriesForm = {
    student_id: string;
    teacher_id: string;
    service_id: string;
    subject: string;
    weekdays: number[];
    start_time: string;
    duration_minutes: string;
    starts_on: string;
    end_mode: 'count' | 'date';
    sessions_count: string;
    ends_on: string;
    notes: string;
};

/** Clases que se repiten cada semana (ej. lunes y miércoles, 10 clases). */
export function SeriesDialog({ open, onOpenChange, defaultStudentId, students, services, teachers = [], defaultTeacherId }: SeriesDialogProps) {
    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm<SeriesForm>({
        student_id: String(defaultStudentId ?? ''),
        teacher_id: String(defaultTeacherId ?? ''),
        service_id: '',
        subject: '',
        weekdays: [],
        start_time: '16:00',
        duration_minutes: '60',
        starts_on: todayISO(),
        end_mode: 'count',
        sessions_count: '8',
        ends_on: '',
        notes: '',
    });
    const [preview, setPreview] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            clearErrors();
            if (defaultStudentId) setData('student_id', String(defaultStudentId));
            if (defaultTeacherId) setData('teacher_id', String(defaultTeacherId));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, defaultStudentId, defaultTeacherId]);

    // Vista previa de las primeras fechas (se calcula igual que en el servidor)
    const dates = useMemo(() => {
        if (data.weekdays.length === 0 || !data.starts_on) return [];
        const [y, m, d] = data.starts_on.split('-').map(Number);
        const day = new Date(y, m - 1, d);
        const end = data.end_mode === 'date' && data.ends_on ? new Date(`${data.ends_on}T23:59:59`) : null;
        const limit = data.end_mode === 'count' ? Math.min(Number(data.sessions_count) || 0, 120) : 120;
        const result: Date[] = [];
        for (let i = 0; i < 400 && result.length < limit; i++) {
            if (end && day > end) break;
            const iso = day.getDay() === 0 ? 7 : day.getDay();
            if (data.weekdays.includes(iso)) result.push(new Date(day));
            day.setDate(day.getDate() + 1);
        }
        return result;
    }, [data.weekdays, data.starts_on, data.end_mode, data.sessions_count, data.ends_on]);

    useEffect(() => {
        setPreview(dates.slice(0, 6).map((d) => d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })));
    }, [dates]);

    const toggleDay = (value: number) =>
        setData('weekdays', data.weekdays.includes(value) ? data.weekdays.filter((d) => d !== value) : [...data.weekdays, value].sort());

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({
            ...d,
            sessions_count: d.end_mode === 'count' ? d.sessions_count : '',
            ends_on: d.end_mode === 'date' ? d.ends_on : '',
        }));
        post(route('admin.series.store'), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Repeat className="text-primary size-5" /> Clases recurrentes
                    </DialogTitle>
                    <DialogDescription>Agenda varias clases de una vez. Después puedes mover o cancelar cualquiera por separado.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-4">
                    <StudentAndTopicFields
                        data={data}
                        setData={setData}
                        errors={errors}
                        students={students}
                        services={services}
                        teachers={teachers}
                    />

                    <FormField label="¿Qué días de la semana?" error={errors.weekdays}>
                        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Días de la semana">
                            {WEEKDAYS.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    aria-pressed={data.weekdays.includes(day.value)}
                                    aria-label={day.label}
                                    title={day.label}
                                    onClick={() => toggleDay(day.value)}
                                    className={cn(
                                        'size-10 rounded-full text-sm font-bold transition',
                                        data.weekdays.includes(day.value) ? 'bg-primary text-primary-foreground shadow' : 'bg-muted hover:bg-accent',
                                    )}
                                >
                                    {day.short}
                                </button>
                            ))}
                        </div>
                    </FormField>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <FormField label="Empieza el" htmlFor="series-start" error={errors.starts_on} className="col-span-2 sm:col-span-1">
                            <Input
                                id="series-start"
                                type="date"
                                value={data.starts_on}
                                onChange={(e) => setData('starts_on', e.target.value)}
                                required
                            />
                        </FormField>
                        <FormField label="Hora" htmlFor="series-time" error={errors.start_time}>
                            <Input
                                id="series-time"
                                type="time"
                                step={300}
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                                required
                            />
                        </FormField>
                        <FormField label="Duración" htmlFor="series-duration" error={errors.duration_minutes}>
                            <DurationSelect id="series-duration" value={data.duration_minutes} onChange={(v) => setData('duration_minutes', v)} />
                        </FormField>
                    </div>

                    <FormField label="¿Cuándo termina?" error={errors.sessions_count || errors.ends_on}>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <label
                                className={cn(
                                    'flex items-center gap-2 rounded-xl border p-3',
                                    data.end_mode === 'count' && 'border-primary bg-primary/5',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="end_mode"
                                    checked={data.end_mode === 'count'}
                                    onChange={() => setData('end_mode', 'count')}
                                    className="accent-primary"
                                />
                                <span className="text-sm">Después de</span>
                                <Input
                                    type="number"
                                    min={1}
                                    max={120}
                                    value={data.sessions_count}
                                    onFocus={() => setData('end_mode', 'count')}
                                    onChange={(e) => setData('sessions_count', e.target.value)}
                                    className="h-8 w-16"
                                    aria-label="Número de clases"
                                />
                                <span className="text-sm">clases</span>
                            </label>
                            <label
                                className={cn(
                                    'flex items-center gap-2 rounded-xl border p-3',
                                    data.end_mode === 'date' && 'border-primary bg-primary/5',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="end_mode"
                                    checked={data.end_mode === 'date'}
                                    onChange={() => setData('end_mode', 'date')}
                                    className="accent-primary"
                                />
                                <span className="text-sm">El día</span>
                                <Input
                                    type="date"
                                    value={data.ends_on}
                                    min={data.starts_on}
                                    onFocus={() => setData('end_mode', 'date')}
                                    onChange={(e) => setData('ends_on', e.target.value)}
                                    className="h-8"
                                    aria-label="Fecha final"
                                />
                            </label>
                        </div>
                    </FormField>

                    {dates.length > 0 && (
                        <div className="bg-primary/5 rounded-xl p-3 text-sm">
                            <p className="font-semibold">
                                Se agendarán {dates.length} {dates.length === 1 ? 'clase' : 'clases'}:
                            </p>
                            <p className="text-muted-foreground mt-1">
                                {preview.join(' · ')}
                                {dates.length > preview.length && ` … y ${dates.length - preview.length} más`}
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || dates.length === 0}>
                            {processing && <LoaderCircle className="animate-spin" />}
                            Agendar {dates.length > 0 ? `${dates.length} clases` : 'clases'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// --- Campos compartidos ---

type TopicData = { student_id: string; teacher_id: string; service_id: string; subject: string };

function StudentAndTopicFields<T extends TopicData>({
    data,
    setData,
    errors,
    students,
    services,
    teachers,
}: {
    data: T;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData: (key: any, value: any) => void;
    errors: Partial<Record<string, string>>;
    students: StudentOption[];
    services: ServiceOption[];
    teachers: TeacherOption[];
}) {
    const teacher = teachers.find((t) => String(t.id) === data.teacher_id);

    return (
        <>
            {teachers.length > 0 && (
                <FormField label="Maestro" htmlFor="appt-teacher" error={errors.teacher_id}>
                    <div className="flex items-center gap-2">
                        <span
                            className="size-4 shrink-0 rounded-full border"
                            style={{ background: teacher?.color ?? 'transparent' }}
                            aria-hidden="true"
                        />
                        <div className="flex-1">
                            <NativeSelect id="appt-teacher" value={data.teacher_id} onChange={(e) => setData('teacher_id', e.target.value)} required>
                                <option value="" disabled>
                                    Elige al maestro…
                                </option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>
                </FormField>
            )}
            <FormField label="Alumno" htmlFor="appt-student" error={errors.student_id}>
                <NativeSelect id="appt-student" value={data.student_id} onChange={(e) => setData('student_id', e.target.value)} required>
                    <option value="" disabled>
                        Elige al alumno…
                    </option>
                    {students.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                            {s.guardian ? ` (${s.guardian})` : ''}
                        </option>
                    ))}
                </NativeSelect>
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Servicio" htmlFor="appt-service" error={errors.service_id} optional>
                    <NativeSelect id="appt-service" value={data.service_id} onChange={(e) => setData('service_id', e.target.value)}>
                        <option value="">Sin servicio</option>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.title}
                            </option>
                        ))}
                    </NativeSelect>
                </FormField>
                <FormField label="Materia o tema" htmlFor="appt-subject" error={errors.subject} optional>
                    <Input
                        id="appt-subject"
                        value={data.subject}
                        onChange={(e) => setData('subject', e.target.value)}
                        placeholder="Matemáticas"
                        maxLength={120}
                    />
                </FormField>
            </div>
        </>
    );
}

function DurationSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
    return (
        <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
            {DURATIONS.map((m) => (
                <option key={m} value={m}>
                    {m < 60 ? `${m} min` : m === 60 ? '1 hora' : `${m / 60} horas`}
                </option>
            ))}
        </NativeSelect>
    );
}
