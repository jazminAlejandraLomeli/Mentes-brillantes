import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { EmptyState } from '@/components/admin/empty-state';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { VisibilityToggle } from '@/components/admin/visibility-toggle';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type Location } from '@/types/admin';
import { Head, Link } from '@inertiajs/react';
import { Clock, ExternalLink, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';

export default function LocationsIndex({ locations }: { locations: Location[] }) {
    const ids = locations.map((l) => l.id);

    return (
        <AppLayout breadcrumbs={[{ title: 'Sucursales', href: route('admin.locations.index') }]}>
            <Head title="Sucursales" />
            <PageBody>
                <PageHeader
                    title="Sucursales"
                    description="La dirección, el horario y el mapa de cada local aparecen en la página, en «Visítanos»."
                    actions={
                        <Button asChild className="rounded-full">
                            <Link href={route('admin.locations.create')}>
                                <Plus /> Nueva sucursal
                            </Link>
                        </Button>
                    }
                />

                {locations.length === 0 ? (
                    <EmptyState
                        title="Todavía no hay sucursales"
                        description="Agrega la dirección de tu local para que los papás sepan cómo llegar. Si solo das clases en línea, déjalo así y la sección no aparece."
                        action={
                            <Button asChild className="rounded-full">
                                <Link href={route('admin.locations.create')}>
                                    <Plus /> Agregar dirección
                                </Link>
                            </Button>
                        }
                    />
                ) : (
                    <ul className="grid gap-3">
                        {locations.map((location, index) => (
                            <li
                                key={location.id}
                                className="bg-card flex flex-col gap-4 rounded-2xl border p-3 shadow-sm sm:flex-row sm:items-center"
                            >
                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                    {locations.length > 1 && <ReorderButtons ids={ids} index={index} url={route('admin.locations.reorder')} />}
                                    <div
                                        className={cn(
                                            'bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-2xl',
                                            !location.is_active && 'opacity-50 grayscale',
                                        )}
                                    >
                                        <MapPin className="size-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-heading text-lg font-bold">{location.name || 'Sucursal'}</p>
                                        <p className="text-muted-foreground text-sm">{location.address}</p>
                                        {location.landmark && <p className="text-muted-foreground text-xs">{location.landmark}</p>}
                                        {location.schedule_list.length > 0 && (
                                            <p className="text-muted-foreground mt-1 flex items-start gap-1 text-xs">
                                                <Clock className="mt-0.5 size-3.5 shrink-0" /> {location.schedule_list.join(' · ')}
                                            </p>
                                        )}
                                        <a
                                            href={location.directions_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary mt-1 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                                        >
                                            Revisar en Google Maps <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
                                    <VisibilityToggle
                                        url={route('admin.locations.toggle', location.id)}
                                        visible={location.is_active}
                                        label="Mostrar en la página"
                                        onText="En la página"
                                    />
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('admin.locations.edit', location.id)}>
                                                <Pencil /> Editar
                                            </Link>
                                        </Button>
                                        <ConfirmDelete
                                            url={route('admin.locations.destroy', location.id)}
                                            title={`¿Eliminar ${location.name || 'esta sucursal'}?`}
                                            description="Se quita de la página. Si solo cerró por un tiempo, mejor apaga «En la página»."
                                            confirmLabel="Sí, eliminar"
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:bg-red-50"
                                                    aria-label={`Eliminar ${location.name || 'sucursal'}`}
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
