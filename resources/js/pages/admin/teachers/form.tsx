import { FormActions } from '@/components/admin/form-actions';
import { FormCard, FormField } from '@/components/admin/form-field';
import { ImageInput } from '@/components/admin/image-input';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { SwitchField } from '@/components/ui/switch';
import { TagsInput } from '@/components/ui/tags-input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type Teacher } from '@/types/admin';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { type FormEventHandler } from 'react';

type TeacherForm = {
    name: string;
    full_name: string;
    title: string;
    bio: string;
    education: string;
    specialties: string[];
    photo: File | null;
    remove_photo: boolean;
    color: string;
    whatsapp_phone: string;
    is_active: boolean;
    show_on_website: boolean;
};

interface Props {
    teacher: Teacher | null;
    colors: string[];
    suggestedColor: string;
}

const SPECIALTY_IDEAS = [
    'Lectura',
    'Escritura',
    'Matemáticas',
    'Lectoescritura',
    'Inglés',
    'Ciencias',
    'Manualidades',
    'Tareas',
    'Exámenes',
    'Preescolar',
];

export default function TeacherFormPage({ teacher, colors, suggestedColor }: Props) {
    const { site } = usePage<SharedData>().props;
    const multiTeacher = Boolean(site.features?.multi_teacher);
    const editing = teacher !== null;

    const { data, setData, post, processing, errors, transform } = useForm<TeacherForm>({
        name: teacher?.name ?? '',
        full_name: teacher?.full_name ?? '',
        title: teacher?.title ?? '',
        bio: teacher?.bio ?? '',
        education: teacher?.education ?? '',
        specialties: teacher?.specialties ?? [],
        photo: null,
        remove_photo: false,
        color: teacher?.color ?? suggestedColor,
        whatsapp_phone: teacher?.whatsapp_phone ?? '',
        is_active: teacher?.is_active ?? true,
        show_on_website: teacher?.show_on_website ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((d) => ({ ...d, ...(editing ? { _method: 'put' } : {}) }));
        post(editing ? route('admin.teachers.update', teacher.id) : route('admin.teachers.store'), { forceFormData: true });
    };

    const title = editing ? `Editar a ${teacher.name}` : 'Nuevo maestro';
    const specialtyError = Object.entries(errors).find(([k]) => k.startsWith('specialties'))?.[1];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Maestros', href: route('admin.teachers.index') },
                { title, href: '#' },
            ]}
        >
            <Head title={title} />
            <PageBody>
                <PageHeader title={title} description="Así aparecerá en la sección «Conoce a tu maestra» de la página." />

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
                    <div className="grid content-start gap-6">
                        <FormCard title="Foto">
                            <ImageInput
                                currentUrl={teacher?.photo_url}
                                file={data.photo}
                                onChange={(file) => setData((d) => ({ ...d, photo: file, remove_photo: false }))}
                                onRemove={() => setData('remove_photo', true)}
                                removed={data.remove_photo}
                                aspect="aspect-[4/5]"
                                hint="Una foto vertical, con buena luz y sonriendo 😊"
                            />
                            {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
                        </FormCard>

                        <FormCard title="Publicación">
                            <SwitchField
                                id="show_on_website"
                                label="Mostrar en la página"
                                checked={data.show_on_website}
                                onCheckedChange={(v) => setData('show_on_website', v)}
                            />
                            {multiTeacher && (
                                <SwitchField
                                    id="is_active"
                                    label="Disponible para agendar clases"
                                    description="Apágalo si ya no da clases (su historial se conserva)."
                                    checked={data.is_active}
                                    onCheckedChange={(v) => setData('is_active', v)}
                                />
                            )}
                        </FormCard>
                    </div>

                    <div className="grid content-start gap-6">
                        <FormCard title="¿Quién es?">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <FormField label="¿Cómo le dicen los niños?" htmlFor="name" error={errors.name} hint="Se ve en letras grandes.">
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Miss Liz"
                                        maxLength={120}
                                        autoFocus={!editing}
                                    />
                                </FormField>
                                <FormField label="Nombre completo" htmlFor="full_name" error={errors.full_name} optional>
                                    <Input
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        placeholder="Lizbeth González Ulloa"
                                        maxLength={150}
                                    />
                                </FormField>
                            </div>
                            <FormField label="Título o profesión" htmlFor="title" error={errors.title} optional>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Licenciada en Pedagogía"
                                    maxLength={150}
                                />
                            </FormField>
                            <FormField
                                label="Especialidades"
                                htmlFor="specialties"
                                error={specialtyError}
                                optional
                                hint="Escribe y presiona Enter para agregar cada una."
                            >
                                <TagsInput
                                    id="specialties"
                                    value={data.specialties}
                                    onChange={(tags) => setData('specialties', tags)}
                                    placeholder="Ej. Lectura, Matemáticas…"
                                    suggestions={SPECIALTY_IDEAS}
                                />
                            </FormField>
                        </FormCard>

                        <FormCard title="Trayectoria y formación">
                            <FormField
                                label="Trayectoria"
                                htmlFor="bio"
                                error={errors.bio}
                                optional
                                hint={`${data.bio.length}/2000 · Cuéntales a los papás cómo trabajas y tu experiencia.`}
                            >
                                <Textarea
                                    id="bio"
                                    rows={5}
                                    maxLength={2000}
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Llevo 8 años acompañando a niños de primaria. Me encanta enseñar con juegos…"
                                />
                            </FormField>
                            <FormField label="Formación" htmlFor="education" error={errors.education} optional hint="Un estudio por renglón.">
                                <Textarea
                                    id="education"
                                    rows={4}
                                    value={data.education}
                                    onChange={(e) => setData('education', e.target.value)}
                                    placeholder={'Licenciatura en Pedagogía · UdeG\nDiplomado en Aprendizaje Lúdico\nCertificación en Lectoescritura'}
                                />
                            </FormField>
                        </FormCard>

                        {multiTeacher && (
                            <FormCard title="Agenda" description="Para distinguir sus clases en el calendario.">
                                <FormField label="Color" error={errors.color}>
                                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color del maestro">
                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                role="radio"
                                                aria-checked={data.color === color}
                                                aria-label={`Color ${color}`}
                                                onClick={() => setData('color', color)}
                                                className={cn(
                                                    'flex size-9 items-center justify-center rounded-full ring-offset-2 transition',
                                                    data.color === color && 'ring-foreground ring-2',
                                                )}
                                                style={{ background: color }}
                                            >
                                                {data.color === color && <Check className="size-4 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </FormField>
                                <FormField label="WhatsApp" htmlFor="whatsapp_phone" error={errors.whatsapp_phone} optional>
                                    <PhoneInput
                                        id="whatsapp_phone"
                                        value={data.whatsapp_phone}
                                        onChange={(digits) => setData('whatsapp_phone', digits)}
                                        invalid={Boolean(errors.whatsapp_phone)}
                                    />
                                </FormField>
                            </FormCard>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <FormActions cancelHref={route('admin.teachers.index')} processing={processing} />
                    </div>
                </form>
            </PageBody>
        </AppLayout>
    );
}
