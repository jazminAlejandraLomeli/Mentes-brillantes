import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { EmptyState } from '@/components/admin/empty-state';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { VisibilityToggle } from '@/components/admin/visibility-toggle';
import { RainbowMark } from '@/components/brand/rainbow-mark';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type Option, type Service } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { EyeOff, Pencil, Plus, Star } from 'lucide-react';

interface Props {
    services: Service[];
    categories: Option[];
    filters: { category: string | null };
}

export default function ServicesIndex({ services, categories, filters }: Props) {
    const ids = services.map((s) => s.id);
    const filter = (category: string | null) => router.get(route('admin.services.index'), category ? { category } : {}, { preserveState: true });

    return (
        <AppLayout breadcrumbs={[{ title: 'Servicios y cursos', href: route('admin.services.index') }]}>
            <Head title="Servicios y cursos" />
            <PageBody>
                <PageHeader
                    title="Servicios y cursos"
                    description="Las tarjetas de clases que ven los papás en tu página."
                    actions={
                        <Button asChild className="rounded-full">
                            <Link href={route('admin.services.create')}>
                                <Plus /> Nuevo servicio
                            </Link>
                        </Button>
                    }
                />

                <div className="flex flex-wrap gap-2">
                    {[{ value: null, label: 'Todos' }, ...categories].map((c) => (
                        <button
                            key={c.value ?? 'all'}
                            type="button"
                            onClick={() => filter(c.value)}
                            className={cn(
                                'rounded-full px-3.5 py-1.5 text-sm font-semibold transition',
                                filters.category === c.value ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent border',
                            )}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                {services.length === 0 ? (
                    <EmptyState
                        title="No hay servicios aquí"
                        description="Agrega tus clases de regularización, talleres o cursos de verano."
                        action={
                            <Button asChild className="rounded-full">
                                <Link href={route('admin.services.create')}>
                                    <Plus /> Agregar servicio
                                </Link>
                            </Button>
                        }
                    />
                ) : (
                    <ul className="grid gap-3">
                        {services.map((service, index) => (
                            <li key={service.id} className="bg-card flex flex-col gap-4 rounded-2xl border p-3 shadow-sm sm:flex-row sm:items-center">
                                <div className="flex items-center gap-3">
                                    {!filters.category && <ReorderButtons ids={ids} index={index} url={route('admin.services.reorder')} />}
                                    <div
                                        className={cn(
                                            'bg-muted size-20 shrink-0 overflow-hidden rounded-xl',
                                            !service.is_active && 'opacity-40 grayscale',
                                        )}
                                    >
                                        {service.image_url ? (
                                            <img src={service.image_url} alt="" className="size-full object-cover" />
                                        ) : (
                                            <div className="flex size-full items-center justify-center">
                                                <RainbowMark className="h-6" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-1.5 font-semibold">
                                        {service.title}
                                        {service.is_featured && <Star className="size-4 fill-amber-400 text-amber-400" aria-label="Destacado" />}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        {service.category_label} · {service.modality_label}
                                        {service.age_range && ` · ${service.age_range}`}
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {service.price ? (
                                            <>
                                                <span className="font-semibold">{formatPrice(service.price)}</span>
                                                {service.price_note && <span className="text-muted-foreground"> {service.price_note}</span>}
                                                {!service.show_price && (
                                                    <span className="text-muted-foreground ml-2 inline-flex items-center gap-1 text-xs">
                                                        <EyeOff className="size-3.5" /> precio oculto en la página
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">Sin precio (los papás piden informes)</span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                    <VisibilityToggle
                                        url={route('admin.services.toggle', service.id)}
                                        visible={service.is_active ?? true}
                                        label="Mostrar en la página"
                                    />
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('admin.services.edit', service.id)}>
                                                <Pencil /> Editar
                                            </Link>
                                        </Button>
                                        <ConfirmDelete
                                            url={route('admin.services.destroy', service.id)}
                                            title="¿Eliminar este servicio?"
                                            description={`Se borrará «${service.title}». Las clases ya agendadas no se borran, solo dejan de estar ligadas a este servicio.`}
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
