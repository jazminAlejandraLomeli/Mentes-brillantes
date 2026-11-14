import { EmptyState } from '@/components/admin/empty-state';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type Paginated, type Student } from '@/types/admin';
import { Head, Link, router } from '@inertiajs/react';
import { CalendarClock, ChevronRight, Plus, Search, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    students: Paginated<Student>;
    filters: { q: string; status: 'active' | 'inactive' | 'all' };
}

const statusTabs = [
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Dados de baja' },
    { value: 'all', label: 'Todos' },
] as const;

export default function StudentsIndex({ students, filters }: Props) {
    const [q, setQ] = useState(filters.q);
    const first = useRef(true);

    // Busca mientras escribes (con una pequeña pausa)
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const t = window.setTimeout(() => {
            router.get(route('admin.students.index'), { q: q || undefined, status: filters.status }, { preserveState: true, replace: true });
        }, 300);

        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Alumnos', href: route('admin.students.index') }]}>
            <Head title="Alumnos" />
            <PageBody>
                <PageHeader
                    title="Alumnos y familias"
                    description={`${students.meta.total} ${students.meta.total === 1 ? 'alumno' : 'alumnos'}`}
                    actions={
                        <Button asChild className="rounded-full">
                            <Link href={route('admin.students.create')}>
                                <UserPlus /> Nuevo alumno
                            </Link>
                        </Button>
                    }
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por nombre del niño, tutor o teléfono…"
                            className="pl-9"
                            aria-label="Buscar alumnos"
                        />
                    </div>
                    <div className="flex gap-1">
                        {statusTabs.map((tab) => (
                            <Link
                                key={tab.value}
                                href={route('admin.students.index', { q: filters.q || undefined, status: tab.value })}
                                preserveState
                                className={cn(
                                    'rounded-full px-3.5 py-1.5 text-sm font-semibold transition',
                                    filters.status === tab.value ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent border',
                                )}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {students.data.length === 0 ? (
                    <EmptyState
                        title={filters.q ? 'No encontramos a nadie con esa búsqueda' : 'Todavía no hay alumnos'}
                        description={
                            filters.q
                                ? 'Revisa cómo está escrito el nombre.'
                                : 'Registra a tu primer alumno junto con los datos de su mamá, papá o tutor.'
                        }
                        action={
                            !filters.q && (
                                <Button asChild className="rounded-full">
                                    <Link href={route('admin.students.create')}>
                                        <Plus /> Registrar alumno
                                    </Link>
                                </Button>
                            )
                        }
                    />
                ) : (
                    <ul className="bg-card divide-y rounded-2xl border shadow-sm">
                        {students.data.map((student) => (
                            <li key={student.id} className="flex items-center gap-3 p-3 sm:p-4">
                                <Link href={route('admin.students.show', student.id)} className="flex min-w-0 flex-1 items-center gap-3">
                                    <span
                                        className={cn(
                                            'bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                                            !student.is_active && 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {student.name
                                            .split(' ')
                                            .slice(0, 2)
                                            .map((w) => w[0])
                                            .join('')}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate font-semibold">{student.name}</span>
                                        <span className="text-muted-foreground block truncate text-sm">
                                            {student.school_grade_label}
                                            {student.guardian && ` · ${student.guardian.name}`}
                                        </span>
                                        {student.next_appointment && (
                                            <span className="text-primary mt-0.5 flex items-center gap-1 text-xs font-semibold">
                                                <CalendarClock className="size-3.5" />
                                                <span className="first-letter:uppercase">
                                                    {student.next_appointment.date_label}, {student.next_appointment.time_label.split(' – ')[0]}
                                                </span>
                                            </span>
                                        )}
                                    </span>
                                </Link>
                                {student.guardian && (
                                    <Button
                                        asChild
                                        size="icon"
                                        variant="ghost"
                                        className="text-[#1fb857] hover:bg-[#25D366]/10"
                                        aria-label={`WhatsApp de ${student.guardian.name}`}
                                    >
                                        <a href={student.guardian.whatsapp_url} target="_blank" rel="noopener noreferrer">
                                            <WhatsAppIcon className="size-5" />
                                        </a>
                                    </Button>
                                )}
                                <ChevronRight className="text-muted-foreground hidden size-5 sm:block" />
                            </li>
                        ))}
                    </ul>
                )}

                {students.meta.last_page > 1 && (
                    <nav aria-label="Páginas" className="flex justify-center gap-2">
                        {students.links.prev && (
                            <Button variant="outline" asChild>
                                <Link href={students.links.prev} preserveScroll>
                                    Anterior
                                </Link>
                            </Button>
                        )}
                        <span className="text-muted-foreground self-center text-sm">
                            Página {students.meta.current_page} de {students.meta.last_page}
                        </span>
                        {students.links.next && (
                            <Button variant="outline" asChild>
                                <Link href={students.links.next} preserveScroll>
                                    Siguiente
                                </Link>
                            </Button>
                        )}
                    </nav>
                )}
            </PageBody>
        </AppLayout>
    );
}
