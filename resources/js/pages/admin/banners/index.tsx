import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { EmptyState } from '@/components/admin/empty-state';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { VisibilityToggle } from '@/components/admin/visibility-toggle';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Banner } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';

export default function BannersIndex({ banners }: { banners: Banner[] }) {
    const ids = banners.map((b) => b.id);

    return (
        <AppLayout breadcrumbs={[{ title: 'Banners', href: route('admin.banners.index') }]}>
            <Head title="Banners" />
            <PageBody>
                <PageHeader
                    title="Banners del carrusel"
                    description="Las imágenes grandes que se van pasando arriba de tu página. Usa las flechas para cambiar el orden."
                    actions={
                        <Button asChild className="rounded-full">
                            <Link href={route('admin.banners.create')}>
                                <Plus /> Nuevo banner
                            </Link>
                        </Button>
                    }
                />

                {banners.length === 0 ? (
                    <EmptyState
                        title="Todavía no hay banners"
                        description="Sube una imagen llamativa con una promoción o un aviso importante."
                        action={
                            <Button asChild className="rounded-full">
                                <Link href={route('admin.banners.create')}>
                                    <Plus /> Crear el primero
                                </Link>
                            </Button>
                        }
                    />
                ) : (
                    <ul className="grid gap-3">
                        {banners.map((banner, index) => (
                            <li key={banner.id} className="bg-card flex flex-col gap-4 rounded-2xl border p-3 shadow-sm sm:flex-row sm:items-center">
                                <div className="flex items-center gap-3">
                                    <ReorderButtons ids={ids} index={index} url={route('admin.banners.reorder')} />
                                    <img
                                        src={banner.image_url ?? ''}
                                        alt=""
                                        className={`aspect-[16/7] w-40 shrink-0 rounded-xl object-cover sm:w-48 ${banner.is_active ? '' : 'opacity-40 grayscale'}`}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">{banner.title}</p>
                                    {banner.subtitle && <p className="text-muted-foreground line-clamp-2 text-sm">{banner.subtitle}</p>}
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Botón: <span className="font-medium">{banner.cta_label || '¡Quiero informes!'}</span> →{' '}
                                        {banner.cta_url || 'WhatsApp'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                    <VisibilityToggle
                                        url={route('admin.banners.toggle', banner.id)}
                                        visible={banner.is_active}
                                        label="Mostrar en la página"
                                    />
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('admin.banners.edit', banner.id)}>
                                                <Pencil /> Editar
                                            </Link>
                                        </Button>
                                        <ConfirmDelete
                                            url={route('admin.banners.destroy', banner.id)}
                                            title="¿Eliminar este banner?"
                                            description={`Se borrará «${banner.title}» y su imagen. Esto no se puede deshacer.`}
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
