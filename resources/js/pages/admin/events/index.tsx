import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { EmptyState } from '@/components/admin/empty-state';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { VisibilityToggle } from '@/components/admin/visibility-toggle';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dateBadge } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type SiteEvent } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { Megaphone, Pencil, Plus } from 'lucide-react';

export default function EventsIndex({ events }: { events: SiteEvent[] }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Eventos y avisos', href: route('admin.events.index') }]}>
            <Head title="Eventos y avisos" />
            <PageBody>
                <PageHeader
                    title="Eventos y avisos"
                    description="Inscripciones abiertas, talleres de temporada, fechas especiales… Los que ya pasaron dejan de verse solos en la página."
                    actions={
                        <Button asChild className="rounded-full">
                            <Link href={route('admin.events.create')}>
                                <Plus /> Nuevo aviso
                            </Link>
                        </Button>
                    }
                />

                {events.length === 0 ? (
                    <EmptyState title="Todavía no hay avisos" description="Publica tu próximo taller o avisa que las inscripciones están abiertas." />
                ) : (
                    <ul className="grid gap-3">
                        {events.map((event) => (
                            <li
                                key={event.id}
                                className={cn(
                                    'bg-card flex flex-col gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center',
                                    event.is_past && 'opacity-60',
                                )}
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-4">
                                    {event.event_date ? (
                                        <span className="bg-primary/10 text-primary flex size-14 shrink-0 flex-col items-center justify-center rounded-xl">
                                            <span className="text-xl leading-none font-bold">{dateBadge(event.event_date).day}</span>
                                            <span className="text-[0.65rem] font-bold uppercase">{dateBadge(event.event_date).month}</span>
                                        </span>
                                    ) : (
                                        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                            <Megaphone className="size-6" />
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-semibold">{event.title}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {event.is_past ? 'Ya pasó · ' : ''}
                                            {event.date_label ? (
                                                <span className="first-letter:uppercase">{event.date_label}</span>
                                            ) : (
                                                'Aviso sin fecha'
                                            )}
                                            {event.time_label && ` · ${event.time_label}`}
                                        </p>
                                        <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">{event.body}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                    <VisibilityToggle url={route('admin.events.toggle', event.id)} visible={event.is_published} label="Publicar" />
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('admin.events.edit', event.id)}>
                                                <Pencil /> Editar
                                            </Link>
                                        </Button>
                                        <ConfirmDelete
                                            url={route('admin.events.destroy', event.id)}
                                            title="¿Eliminar este aviso?"
                                            description={`Se borrará «${event.title}». Esto no se puede deshacer.`}
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
