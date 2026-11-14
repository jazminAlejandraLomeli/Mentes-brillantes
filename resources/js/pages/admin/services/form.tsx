import { FormActions } from '@/components/admin/form-actions';
import { FormCard, FormField } from '@/components/admin/form-field';
import { ImageInput } from '@/components/admin/image-input';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { SwitchField } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type Option, type Service } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

type ServiceForm = {
    title: string;
    category: string;
    short_description: string;
    description: string;
    age_min: string;
    age_max: string;
    modality: string;
    price: string;
    price_note: string;
    show_price: boolean;
    is_featured: boolean;
    is_active: boolean;
    image: File | null;
    remove_image: boolean;
};

interface Props {
    service: Service | null;
    categories: Option[];
    modalities: Option[];
}

export default function ServiceFormPage({ service, categories, modalities }: Props) {
    const editing = service !== null;
    const { data, setData, post, processing, errors, transform } = useForm<ServiceForm>({
        title: service?.title ?? '',
        category: service?.category ?? categories[0]?.value ?? '',
        short_description: service?.short_description ?? '',
        description: service?.description ?? '',
        age_min: service?.age_min?.toString() ?? '',
        age_max: service?.age_max?.toString() ?? '',
        modality: service?.modality ?? modalities[0]?.value ?? '',
        price: service?.price ?? '',
        price_note: service?.price_note ?? '',
        show_price: service?.show_price ?? false,
        is_featured: service?.is_featured ?? false,
        is_active: service?.is_active ?? true,
        image: null,
        remove_image: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({ ...d, ...(editing ? { _method: 'put' } : {}) }));
        post(editing ? route('admin.services.update', service.id) : route('admin.services.store'), { forceFormData: true });
    };

    const title = editing ? 'Editar servicio' : 'Nuevo servicio';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Servicios y cursos', href: route('admin.services.index') },
                { title, href: '#' },
            ]}
        >
            <Head title={title} />
            <PageBody>
                <PageHeader title={title} />

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                    <div className="grid gap-6">
                        <FormCard title="¿Qué ofreces?">
                            <FormField label="Nombre" htmlFor="title" error={errors.title}>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Regularización de primaria"
                                    maxLength={120}
                                />
                            </FormField>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="Tipo" htmlFor="category" error={errors.category}>
                                    <NativeSelect id="category" value={data.category} onChange={(e) => setData('category', e.target.value)}>
                                        {categories.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </FormField>
                                <FormField label="Modalidad" htmlFor="modality" error={errors.modality}>
                                    <NativeSelect id="modality" value={data.modality} onChange={(e) => setData('modality', e.target.value)}>
                                        {modalities.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </FormField>
                            </div>
                            <FormField
                                label="Descripción corta"
                                htmlFor="short_description"
                                error={errors.short_description}
                                hint={`${data.short_description.length}/255 · Es lo que se ve en la tarjeta.`}
                            >
                                <Textarea
                                    id="short_description"
                                    rows={2}
                                    maxLength={255}
                                    value={data.short_description}
                                    onChange={(e) => setData('short_description', e.target.value)}
                                    placeholder="Reforzamos matemáticas, español y tareas con un plan a la medida de cada niño."
                                />
                            </FormField>
                            <FormField
                                label="Más detalles"
                                htmlFor="description"
                                error={errors.description}
                                optional
                                hint="Aparece al dar clic en «Ver más detalles»."
                            >
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Horarios, qué incluye, materiales…"
                                />
                            </FormField>
                            <div className="grid grid-cols-2 gap-5">
                                <FormField label="Edad desde" htmlFor="age_min" error={errors.age_min} optional>
                                    <Input
                                        id="age_min"
                                        type="number"
                                        min={1}
                                        max={99}
                                        value={data.age_min}
                                        onChange={(e) => setData('age_min', e.target.value)}
                                        placeholder="6"
                                    />
                                </FormField>
                                <FormField label="Edad hasta" htmlFor="age_max" error={errors.age_max} optional>
                                    <Input
                                        id="age_max"
                                        type="number"
                                        min={1}
                                        max={99}
                                        value={data.age_max}
                                        onChange={(e) => setData('age_max', e.target.value)}
                                        placeholder="12"
                                    />
                                </FormField>
                            </div>
                        </FormCard>

                        <FormCard title="Precio" description="Tú decides si se muestra en la página o si los papás te piden informes.">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="Precio (MXN)" htmlFor="price" error={errors.price} optional>
                                    <Input
                                        id="price"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="250"
                                    />
                                </FormField>
                                <FormField label="Nota del precio" htmlFor="price_note" error={errors.price_note} optional>
                                    <Input
                                        id="price_note"
                                        value={data.price_note}
                                        onChange={(e) => setData('price_note', e.target.value)}
                                        placeholder="por sesión de 1 hora"
                                        maxLength={60}
                                    />
                                </FormField>
                            </div>
                            <SwitchField
                                id="show_price"
                                label="Mostrar el precio en la página"
                                description={data.price ? undefined : 'Escribe un precio para poder mostrarlo.'}
                                checked={data.show_price && Boolean(data.price)}
                                onCheckedChange={(v) => setData('show_price', v)}
                            />
                        </FormCard>
                    </div>

                    <div className="grid content-start gap-6">
                        <FormCard title="Foto">
                            <ImageInput
                                currentUrl={service?.image_url}
                                file={data.image}
                                onChange={(file) => setData((d) => ({ ...d, image: file, remove_image: false }))}
                                onRemove={() => setData('remove_image', true)}
                                removed={data.remove_image}
                                aspect="aspect-[4/3]"
                            />
                            {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
                        </FormCard>
                        <FormCard title="Publicación">
                            <SwitchField
                                id="is_active"
                                label="Mostrar en la página"
                                checked={data.is_active}
                                onCheckedChange={(v) => setData('is_active', v)}
                            />
                            <SwitchField
                                id="is_featured"
                                label="Destacar como favorito ⭐"
                                description="Sale primero y con una etiqueta especial."
                                checked={data.is_featured}
                                onCheckedChange={(v) => setData('is_featured', v)}
                            />
                        </FormCard>
                    </div>

                    <div className="lg:col-span-2">
                        <FormActions cancelHref={route('admin.services.index')} processing={processing} />
                    </div>
                </form>
            </PageBody>
        </AppLayout>
    );
}
