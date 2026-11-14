import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { EmptyState } from '@/components/admin/empty-state';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { VisibilityToggle } from '@/components/admin/visibility-toggle';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type GalleryItem } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

export default function GalleryIndex({ items }: { items: GalleryItem[] }) {
    const ids = items.map((i) => i.id);

    return (
        <AppLayout breadcrumbs={[{ title: 'Galería', href: route('admin.gallery.index') }]}>
            <Head title="Galería" />
            <PageBody>
                <PageHeader title="Galería de actividades" description="Fotos de tus clases y dinámicas. Puedes subir varias a la vez." />

                <Uploader />

                {items.length === 0 ? (
                    <EmptyState title="La galería está vacía" description="Sube fotos de tus clases para que los papás vean cómo trabajas." />
                ) : (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {items.map((item, index) => (
                            <GalleryCard key={item.id} item={item} index={index} ids={ids} />
                        ))}
                    </ul>
                )}
            </PageBody>
        </AppLayout>
    );
}

function Uploader() {
    const { data, setData, post, processing, errors, reset, progress } = useForm<{ images: File[]; caption: string }>({ images: [], caption: '' });
    const [dragging, setDragging] = useState(false);

    const add = (files: FileList | null) => {
        if (!files) return;
        setData('images', [...data.images, ...Array.from(files).filter((f) => f.type.startsWith('image/'))].slice(0, 20));
    };

    const submit = () =>
        post(route('admin.gallery.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });

    const firstError = Object.entries(errors).find(([key]) => key.startsWith('images'))?.[1];

    return (
        <section className="bg-card rounded-2xl border p-4 shadow-sm sm:p-5">
            <label
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    add(e.dataTransfer.files);
                }}
                className={cn(
                    'text-muted-foreground hover:border-primary hover:text-primary flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition',
                    dragging && 'border-primary bg-primary/5 text-primary',
                )}
            >
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => add(e.target.files)} />
                <ImagePlus className="size-8" />
                <span className="text-sm font-semibold">Elige fotos o arrástralas aquí</span>
                <span className="text-xs">Hasta 20 fotos a la vez · JPG, PNG o WebP</span>
            </label>

            {data.images.length > 0 && (
                <div className="mt-4 grid gap-4">
                    <ul className="flex flex-wrap gap-2">
                        {data.images.map((file, i) => (
                            <li key={`${file.name}-${i}`} className="relative">
                                <img src={URL.createObjectURL(file)} alt="" className="size-20 rounded-lg object-cover" />
                                <button
                                    type="button"
                                    aria-label="Quitar foto"
                                    onClick={() =>
                                        setData(
                                            'images',
                                            data.images.filter((_, j) => j !== i),
                                        )
                                    }
                                    className="absolute -top-2 -right-2 rounded-full bg-white p-1 text-red-600 shadow"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                            value={data.caption}
                            onChange={(e) => setData('caption', e.target.value)}
                            placeholder="Texto para estas fotos (opcional), ej. Taller de manualidades"
                            maxLength={200}
                        />
                        <Button onClick={submit} disabled={processing} className="rounded-full">
                            {processing ? <LoaderCircle className="animate-spin" /> : <Upload />}
                            {processing && progress
                                ? `Subiendo ${progress.percentage}%`
                                : `Subir ${data.images.length} ${data.images.length === 1 ? 'foto' : 'fotos'}`}
                        </Button>
                    </div>
                </div>
            )}
            <InputError message={firstError} className="mt-2" />
        </section>
    );
}

function GalleryCard({ item, index, ids }: { item: GalleryItem; index: number; ids: number[] }) {
    const [caption, setCaption] = useState(item.caption ?? '');
    const [saved, setSaved] = useState(false);
    const dirty = caption !== (item.caption ?? '');

    const saveCaption = () =>
        router.put(
            route('admin.gallery.update', item.id),
            { caption, is_active: item.is_active },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaved(true);
                    window.setTimeout(() => setSaved(false), 1500);
                },
            },
        );

    return (
        <li className="bg-card overflow-hidden rounded-2xl border shadow-sm">
            <div className="relative">
                <img
                    src={item.image_url}
                    alt={item.caption ?? ''}
                    className={cn('aspect-square w-full object-cover', !item.is_active && 'opacity-40 grayscale')}
                />
                <div className="absolute top-2 left-2 rounded-lg bg-white/90 shadow-sm">
                    <ReorderButtons ids={ids} index={index} url={route('admin.gallery.reorder')} />
                </div>
            </div>
            <div className="grid gap-2 p-3">
                <div className="flex gap-1">
                    <Input
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && dirty && saveCaption()}
                        placeholder="Texto de la foto"
                        maxLength={200}
                        className="h-8 text-sm"
                    />
                    {(dirty || saved) && (
                        <Button size="sm" variant={saved ? 'ghost' : 'default'} onClick={saveCaption} disabled={saved} aria-label="Guardar texto">
                            <Check />
                        </Button>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <VisibilityToggle url={route('admin.gallery.toggle', item.id)} visible={item.is_active} label="Mostrar en la página" />
                    <ConfirmDelete
                        url={route('admin.gallery.destroy', item.id)}
                        title="¿Eliminar esta foto?"
                        description="Se borrará de la galería. Esto no se puede deshacer."
                        trigger={
                            <Button variant="ghost" size="icon" className="size-8 text-red-600 hover:bg-red-50" aria-label="Eliminar foto">
                                <Trash2 />
                            </Button>
                        }
                    />
                </div>
            </div>
        </li>
    );
}
