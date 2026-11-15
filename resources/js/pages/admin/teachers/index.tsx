import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { EmptyState } from '@/components/admin/empty-state';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { VisibilityToggle } from '@/components/admin/visibility-toggle';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type Teacher } from '@/types/admin';
import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react';

export default function TeachersIndex({ teachers }: { teachers: Teacher[] }) {
    const { site } = usePage<SharedData>().props;
    const multiTeacher = Boolean(site.features?.multi_teacher);
    const ids = teachers.map((t) => t.id);

    return (
        <AppLayout breadcrumbs={[{ title: 'Maestros', href: route('admin.teachers.index') }]}>
            <Head title="Maestros" />
            <PageBody>
                <PageHeader
                    title="Maestros"
                    description={
                        multiTeacher
                            ? 'Su perfil aparece en la página y cada uno tiene su color en la agenda.'
                            : 'Tu foto, tu trayectoria y tus especialidades aparecen en la página, en «Conoce a tu maestra».'
                    }
                    actions={
                        <Button asChild className="rounded-full">
                            <Link href={route('admin.teachers.create')}>
                                <Plus /> Nuevo maestro
                            </Link>
                        </Button>
                    }
                />

                {teachers.length === 0 ? (
                    <EmptyState
                        title="Todavía no hay maestros"
                        description="Agrega tu perfil para que los papás te conozcan antes de escribirte."
                        action={
                            <Button asChild className="rounded-full">
                                <Link href={route('admin.teachers.create')}>
                                    <Plus /> Agregar perfil
                                </Link>
                            </Button>
                        }
                    />
                ) : (
                    <ul className="grid gap-3">
                        {teachers.map((teacher, index) => (
                            <li key={teacher.id} className="bg-card flex flex-col gap-4 rounded-2xl border p-3 shadow-sm sm:flex-row sm:items-center">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    {teachers.length > 1 && <ReorderButtons ids={ids} index={index} url={route('admin.teachers.reorder')} />}
                                    <div
                                        className={cn(
                                            'bg-muted size-16 shrink-0 overflow-hidden rounded-2xl',
                                            !teacher.show_on_website && 'opacity-50 grayscale',
                                        )}
                                        style={multiTeacher ? { boxShadow: `0 0 0 3px ${teacher.color}` } : undefined}
                                    >
                                        {teacher.photo_url ? (
                                            <img src={teacher.photo_url} alt="" className="size-full object-cover" />
                                        ) : (
                                            <div className="text-muted-foreground flex size-full items-center justify-center">
                                                <UserRound className="size-7" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-heading truncate text-lg font-bold">{teacher.name}</p>
                                        <p className="text-muted-foreground truncate text-sm">
                                            {[teacher.title, teacher.full_name].filter(Boolean).join(' · ') || 'Sin título todavía'}
                                        </p>
                                        {teacher.specialties.length > 0 && (
                                            <p className="text-muted-foreground mt-0.5 truncate text-xs">{teacher.specialties.join(' · ')}</p>
                                        )}
                                        {multiTeacher && (
                                            <Link
                                                href={route('admin.appointments.index', { view: 'list', teacher_id: teacher.id })}
                                                className="text-primary text-xs font-semibold hover:underline"
                                            >
                                                {teacher.upcoming_count === 1 ? '1 clase próxima' : `${teacher.upcoming_count ?? 0} clases próximas`}{' '}
                                                · Ver su agenda
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
                                    <VisibilityToggle
                                        url={route('admin.teachers.website', teacher.id)}
                                        visible={teacher.show_on_website}
                                        label="Mostrar en la página"
                                        onText="En la página"
                                    />
                                    {multiTeacher && (
                                        <VisibilityToggle
                                            url={route('admin.teachers.toggle', teacher.id)}
                                            visible={teacher.is_active}
                                            label="Disponible para agendar"
                                            onText="Agenda"
                                            offText="Sin agenda"
                                        />
                                    )}
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('admin.teachers.edit', teacher.id)}>
                                                <Pencil /> Editar
                                            </Link>
                                        </Button>
                                        <ConfirmDelete
                                            url={route('admin.teachers.destroy', teacher.id)}
                                            title={`¿Dar de baja a ${teacher.name}?`}
                                            description={
                                                multiTeacher
                                                    ? 'Se borra su perfil. Sus clases NO se borran: se quedan en la agenda sin maestro asignado. Si solo dejó de dar clases, mejor apaga «Agenda».'
                                                    : 'Se borra su perfil y su foto de la página.'
                                            }
                                            confirmLabel="Sí, dar de baja"
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:bg-red-50"
                                                    aria-label={`Dar de baja a ${teacher.name}`}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            }
                                        />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </PageBody>
        </AppLayout>
    );
}
