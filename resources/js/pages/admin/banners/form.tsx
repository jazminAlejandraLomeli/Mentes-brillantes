import { FormActions } from '@/components/admin/form-actions';
import { FormCard, FormField } from '@/components/admin/form-field';
import { ImageInput } from '@/components/admin/image-input';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { Input } from '@/components/ui/input';
import { SwitchField } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type Banner } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

type BannerForm = {
    title: string;
    subtitle: string;
    cta_label: string;
    cta_url: string;
    is_active: boolean;
    image: File | null;
};

export default function BannerFormPage({ banner }: { banner: Banner | null }) {
    const editing = banner !== null;
    const { data, setData, post, processing, errors, transform } = useForm<BannerForm>({
        title: banner?.title ?? '',
        subtitle: banner?.subtitle ?? '',
        cta_label: banner?.cta_label ?? '',
        cta_url: banner?.cta_url ?? '',
        is_active: banner?.is_active ?? true,
        image: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Con archivos, la edición se manda como POST + _method=PUT
        transform((d) => ({ ...d, ...(editing ? { _method: 'put' } : {}) }));
        post(editing ? route('admin.banners.update', banner.id) : route('admin.banners.store'), { forceFormData: true });
    };

    const title = editing ? 'Editar banner' : 'Nuevo banner';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Banners', href: route('admin.banners.index') },
                { title, href: '#' },
            ]}
        >
            <Head title={title} />
            <PageBody>
                <PageHeader title={title} description="Tip: usa fotos horizontales y deja espacio a la izquierda para que el texto se lea bien." />

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                    <FormCard title="Imagen">
                        <ImageInput
                            currentUrl={banner?.image_url}
                            file={data.image}
                            onChange={(file) => setData('image', file)}
                            aspect="aspect-[16/7]"
                            hint="Tamaño recomendado: 1920 × 840 px. Nosotros la optimizamos para que cargue rápido."
                        />
                        {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
                    </FormCard>

                    <FormCard title="Texto y botón">
                        <FormField label="Título" htmlFor="title" error={errors.title}>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="¿Tu hijo se está quedando atrás?"
                                maxLength={120}
                            />
                        </FormField>
                        <FormField label="Subtítulo" htmlFor="subtitle" error={errors.subtitle} optional>
                            <Input
                                id="subtitle"
                                value={data.subtitle}
                                onChange={(e) => setData('subtitle', e.target.value)}
                                placeholder="Clases de regularización personalizadas"
                                maxLength={255}
                            />
                        </FormField>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField label="Texto del botón" htmlFor="cta_label" error={errors.cta_label} optional>
                                <Input
                                    id="cta_label"
                                    value={data.cta_label}
                                    onChange={(e) => setData('cta_label', e.target.value)}
                                    placeholder="¡Quiero informes!"
                                    maxLength={60}
                                />
                            </FormField>
                            <FormField
                                label="Enlace del botón"
                                htmlFor="cta_url"
                                error={errors.cta_url}
                                optional
                                hint="Déjalo vacío para que abra tu WhatsApp. Usa #servicios para bajar a tus clases."
                            >
                                <Input
                                    id="cta_url"
                                    value={data.cta_url}
                                    onChange={(e) => setData('cta_url', e.target.value)}
                                    placeholder="(WhatsApp)"
                                />
                            </FormField>
                        </div>
                        <SwitchField
                            id="is_active"
                            label="Mostrar en la página"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', v)}
                        />
                    </FormCard>

                    <div className="lg:col-span-2">
                        <FormActions cancelHref={route('admin.banners.index')} processing={processing} />
                    </div>
                </form>
            </PageBody>
        </AppLayout>
    );
}
