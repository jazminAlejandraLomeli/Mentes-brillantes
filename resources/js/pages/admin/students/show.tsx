import { AppointmentDialog, SeriesDialog } from '@/components/admin/appointment-dialogs';
import { AppointmentList, AppointmentRow } from '@/components/admin/appointment-row';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { EmptyState } from '@/components/admin/empty-state';
import { FormField } from '@/components/admin/form-field';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import AppLayout from '@/layouts/app-layout';
import { type Appointment, type AppointmentSeries, type ServiceOption, type StatusOption, type Student, type StudentOption } from '@/types/admin';
import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarPlus, LoaderCircle, Pencil, Repeat, School, StickyNote, Trash2, UserRound } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';

interface Props {
    student: Student;
    upcoming: Appointment[];
    history: Appointment[];
    series: AppointmentSeries[];
    studentOptions: StudentOption[];
    services: ServiceOption[];
    statuses: StatusOption[];
}

export default function StudentShow({ student, upcoming, history, series, studentOptions, services, statuses }: Props) {
    const [newOpen, setNewOpen] = useState(false);
    const [seriesOpen, setSeriesOpen] = useState(false);
    const [editing, setEditing] = useState<Appointment | null>(null);
    const [guardianOpen, setGuardianOpen] = useState(false);
    const guardian = student.guardian;
    const firstName = student.name.split(' ')[0];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Alumnos', href: route('admin.students.index') },
                { title: student.name, href: route('admin.students.show', student.id) },
            ]}
        >
            <Head title={student.name} />
            <PageBody>
                <PageHeader
                    title={student.name}
                    description={
                        <>
                            {student.school_grade_label}
                            {student.age !== null && ` · ${student.age} años`}
                            {!student.is_active && ' · Dado de baja'}
                        </>
                    }
                    actions={
                        <>
                            <Button variant="outline" className="rounded-full" onClick={() => setSeriesOpen(true)}>
                                <Repeat /> Clases recurrentes
                            </Button>
                            <Button className="rounded-full" onClick={() => setNewOpen(true)}>
                                <CalendarPlus /> Agendar clase
                            </Button>
                        </>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-[1fr_2fr] [&>*]:min-w-0">
                    {/* Datos */}
                    <aside className="grid content-start gap-4 [&>*]:min-w-0">
                        <section className="bg-card rounded-2xl border p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="font-heading font-bold">Datos</h2>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={route('admin.students.edit', student.id)}>
                                        <Pencil /> Editar
                                    </Link>
                                </Button>
                            </div>
                            <dl className="grid gap-3 text-sm">
                                {student.school_name && <Info icon={School} label="Escuela" value={student.school_name} />}
                                {student.notes && <Info icon={StickyNote} label="Notas" value={student.notes} />}
                                {!student.school_name && !student.notes && <p className="text-muted-foreground">Sin notas todavía.</p>}
                            </dl>
                        </section>

                        {guardian && (
                            <section className="bg-card rounded-2xl border p-5 shadow-sm">
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="font-heading font-bold">Tutor</h2>
                                    <Button variant="ghost" size="sm" onClick={() => setGuardianOpen(true)}>
                                        <Pencil /> Editar
                                    </Button>
                                </div>
                                <p className="flex items-center gap-2 font-semibold">
                                    <UserRound className="text-muted-foreground size-4" /> {guardian.name}
                                </p>
                                <p className="text-muted-foreground mt-1 text-sm">{guardian.whatsapp_phone_formatted}</p>
                                {guardian.email && <p className="text-muted-foreground text-sm">{guardian.email}</p>}
                                <Button asChild size="sm" className="mt-4 w-full bg-[#25D366] text-white hover:bg-[#1fb857]">
                                    <a href={guardian.whatsapp_url} target="_blank" rel="noopener noreferrer">
                                        <WhatsAppIcon className="size-4" /> Escribir por WhatsApp
                                    </a>
                                </Button>
                                {guardian.students && guardian.students.length > 1 && (
                                    <div className="mt-4 border-t pt-3 text-sm">
                                        <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">Hermanos</p>
                                        {guardian.students
                                            .filter((s) => s.id !== student.id)
                                            .map((s) => (
                                                <Link
                                                    key={s.id}
                                                    href={route('admin.students.show', s.id)}
                                                    className="text-primary block font-semibold hover:underline"
                                                >
                                                    {s.name}
                                                </Link>
                                            ))}
                                    </div>
                                )}
                            </section>
                        )}

                        <ConfirmDelete
                            url={route('admin.students.destroy', student.id)}
                            title={`¿Eliminar a ${firstName}?`}
                            description="Se borrarán sus datos y TODAS sus clases (también el historial). Si solo dejó de venir, mejor edítalo y márcalo como inactivo."
                            confirmLabel="Sí, eliminar todo"
                            trigger={
                                <Button variant="ghost" size="sm" className="justify-self-start text-red-600 hover:bg-red-50">
                                    <Trash2 /> Eliminar alumno
                                </Button>
                            }
                        />
                    </aside>

                    {/* Clases */}
                    <div className="grid content-start gap-6 [&>*]:min-w-0">
                        {series.length > 0 && (
                            <section>
                                <h2 className="font-heading mb-3 text-lg font-bold">Clases recurrentes</h2>
                                <ul className="grid gap-2">
                                    {series.map((s) => (
                                        <li
                                            key={s.id}
                                            className="bg-card flex flex-col gap-3 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center"
                                        >
                                            <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                                                <Repeat className="size-5" />
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-semibold first-letter:uppercase">{s.summary}</p>
                                                <p className="text-muted-foreground text-sm">
                                                    {s.subject ?? 'Clase'} · quedan {s.remaining_count} de {s.appointments_count}
                                                </p>
                                            </div>
                                            {(s.remaining_count ?? 0) > 0 && (
                                                <ConfirmDelete
                                                    url={route('admin.series.cancel', s.id)}
                                                    method="patch"
                                                    title="¿Cancelar las clases que faltan?"
                                                    description={`Se marcarán como canceladas las ${s.remaining_count} clases que faltan. Las que ya pasaron se quedan en el historial.`}
                                                    confirmLabel="Sí, cancelarlas"
                                                    trigger={
                                                        <Button variant="outline" size="sm">
                                                            Cancelar las que faltan
                                                        </Button>
                                                    }
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section>
                            <h2 className="font-heading mb-3 text-lg font-bold">Próximas clases</h2>
                            {upcoming.length === 0 ? (
                                <EmptyState
                                    title={`${firstName} no tiene clases agendadas`}
                                    action={
                                        <Button className="rounded-full" onClick={() => setNewOpen(true)}>
                                            <CalendarPlus /> Agendar clase
                                        </Button>
                                    }
                                />
                            ) : (
                                <AppointmentList>
                                    {upcoming.map((a) => (
                                        <AppointmentRow key={a.id} appointment={a} showDate onClick={() => setEditing(a)} />
                                    ))}
                                </AppointmentList>
                            )}
                        </section>

                        {history.length > 0 && (
                            <section>
                                <h2 className="font-heading mb-3 text-lg font-bold">Historial</h2>
                                <ul className="bg-card divide-y rounded-2xl border text-sm shadow-sm">
                                    {history.map((a) => (
                                        <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3">
                                            <span>
                                                <span className="font-medium first-letter:uppercase">{a.date_label}</span>
                                                <span className="text-muted-foreground"> · {a.topic}</span>
                                            </span>
                                            <StatusBadge status={a.status} label={a.status_label} />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </div>
            </PageBody>

            <AppointmentDialog open={newOpen} onOpenChange={setNewOpen} defaultStudentId={student.id} students={studentOptions} services={services} />
            <AppointmentDialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
                appointment={editing}
                students={studentOptions}
                services={services}
                statuses={statuses}
            />
            <SeriesDialog
                open={seriesOpen}
                onOpenChange={setSeriesOpen}
                defaultStudentId={student.id}
                students={studentOptions}
                services={services}
            />
            {guardian && <GuardianDialog open={guardianOpen} onOpenChange={setGuardianOpen} guardian={guardian} />}
        </AppLayout>
    );
}

function Info({ icon: Icon, label, value }: { icon: typeof School; label: string; value: string }) {
    return (
        <div className="flex gap-2">
            <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
                <dt className="text-muted-foreground text-xs">{label}</dt>
                <dd className="whitespace-pre-line">{value}</dd>
            </div>
        </div>
    );
}

function GuardianDialog({
    open,
    onOpenChange,
    guardian,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    guardian: NonNullable<Student['guardian']>;
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: guardian.name,
        whatsapp_phone: guardian.whatsapp_phone,
        email: guardian.email ?? '',
        notes: guardian.notes ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.guardians.update', guardian.id), { preserveScroll: true, onSuccess: () => onOpenChange(false) });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Datos del tutor</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <FormField label="Nombre" htmlFor="g-name" error={errors.name}>
                        <Input id="g-name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </FormField>
                    <FormField label="WhatsApp" htmlFor="g-phone" error={errors.whatsapp_phone}>
                        <PhoneInput
                            id="g-phone"
                            value={data.whatsapp_phone}
                            onChange={(digits) => setData('whatsapp_phone', digits)}
                            invalid={Boolean(errors.whatsapp_phone)}
                        />
                    </FormField>
                    <FormField label="Correo" htmlFor="g-email" error={errors.email} optional>
                        <Input id="g-email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    </FormField>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="animate-spin" />} Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
