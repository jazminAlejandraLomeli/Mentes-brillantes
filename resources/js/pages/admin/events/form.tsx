import { FormActions } from '@/components/admin/form-actions';
import { FormCard, FormField } from '@/components/admin/form-field';
import { ImageInput } from '@/components/admin/image-input';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { Input } from '@/components/ui/input';
import { SwitchField } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type SiteEvent } from '@/types/models';
import { Head, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';

type EventForm = {
    title: string;
    body: string;
    event_date: string;
    event_time: string;
    location: string;
    is_published: boolean;
    image: File | null;
    remove_image: boolean;
};

export default function EventFormPage({ event }: { event: SiteEvent | null }) {
    const editing = event !== null;
    const { data, setData, post, processing, errors, transform } = useForm<EventForm>({
        title: event?.title ?? '',
        body: event?.body ?? '',
        event_date: event?.event_date ?? '',
        event_time: event?.event_time ?? '',
        location: event?.location ?? '',
        is_published: event?.is_published ?? true,
        image: null,
        remove_image: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({ ...d, ...(editing ? { _method: 'put' } : {}) }));
        post(editing ? route('admin.events.update', event.id) : route('admin.events.store'), { forceFormData: true });
    };

    const title = editing ? 'Editar aviso' : 'Nuevo aviso';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Eventos y avisos', href: route('admin.events.index') },
                { title, href: '#' },
            ]}
        >
            <Head title={title} />
            <PageBody>
                <PageHeader title={title} />

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                    <FormCard title="Aviso">
                        <FormField label="Título" htmlFor="title" error={errors.title}>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="¡Inscripciones abiertas para el curso de verano!"
                                maxLength={150}
                            />
                        </FormField>
                        <FormField label="Texto" htmlFor="body" error={errors.body}>
                            <Textarea
                                id="body"
                                rows={5}
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                placeholder="Cuéntales a los papás de qué se trata…"
                            />
                        </FormField>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <FormField label="Fecha" htmlFor="event_date" error={errors.event_date} optional hint="Sin fecha = aviso general.">
                                <Input id="event_date" type="date" value={data.event_date} onChange={(e) => setData('event_date', e.target.value)} />
                            </FormField>
                            <FormField label="Hora" htmlFor="event_time" error={errors.event_time} optional>
                                <Input id="event_time" type="time" value={data.event_time} onChange={(e) => setData('event_time', e.target.value)} />
                            </FormField>
                        </div>
                        <FormField label="Lugar" htmlFor="location" error={errors.location} optional>
                            <Input
                                id="location"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                placeholder="Ej. Salón principal"
                                maxLength={150}
                            />
                        </FormField>
                        <SwitchField
                            id="is_published"
                            label="Publicar en la página"
                            checked={data.is_published}
                            onCheckedChange={(v) => setData('is_published', v)}
                        />
                    </FormCard>

                    <FormCard title="Imagen" description="Opcional, pero ayuda a llamar la atención.">
                        <ImageInput
                            currentUrl={event?.image_url}
                            file={data.image}
                            onChange={(file) => setData((d) => ({ ...d, image: file, remove_image: false }))}
                            onRemove={() => setData('remove_image', true)}
                            removed={data.remove_image}
                            aspect="aspect-square"
                        />
                        {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
                    </FormCard>

                    <div className="lg:col-span-2">
                        <FormActions cancelHref={route('admin.events.index')} processing={processing} label={editing ? 'Guardar' : 'Publicar'} />
                    </div>
                </form>
            </PageBody>
        </AppLayout>
    );
}
