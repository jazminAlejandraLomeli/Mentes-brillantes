import { FormCard } from '@/components/admin/form-field';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, LoaderCircle, RotateCcw, Save } from 'lucide-react';
import { type FormEventHandler, useRef } from 'react';

type TemplateKey = 'reminder' | 'cancellation' | 'reschedule';

interface Props {
    templates: Record<TemplateKey, string>;
    defaults: Record<TemplateKey, string>;
    variables: string[];
}

const META: Record<TemplateKey, { title: string; description: string }> = {
    reminder: { title: 'Recordatorio / confirmación', description: 'Para confirmar que el niño asistirá a su clase.' },
    reschedule: { title: 'Cambio de horario', description: 'Cuando mueves una clase a otro día u hora.' },
    cancellation: { title: 'Cancelación', description: 'Cuando una clase no se va a dar.' },
};

const VARIABLE_HELP: Record<string, string> = {
    tutor: 'Nombre de mamá/papá',
    alumno: 'Nombre del niño',
    clase: 'Materia o servicio',
    fecha: 'Día de la clase',
    hora: 'Hora de la clase',
    firma: 'Tu firma',
};

export default function Messages({ templates, defaults, variables }: Props) {
    const { site } = usePage<SharedData>().props;
    const { data, setData, put, processing, errors, isDirty, recentlySuccessful } = useForm<Record<TemplateKey, string>>({ ...templates });

    const sample: Record<string, string> = {
        tutor: 'Mariana',
        alumno: 'Sofía',
        clase: 'Matemáticas',
        fecha: 'lunes 16 de noviembre',
        hora: '5:00 pm',
        firma: site.business.signature,
    };
    const render = (text: string) => text.replace(/\{(\w+)\}/g, (match, key: string) => sample[key] ?? match);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.settings.messages.update'), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Mensajes de WhatsApp', href: route('admin.settings.messages') }]}>
            <Head title="Mensajes de WhatsApp" />
            <PageBody>
                <PageHeader
                    title="Mensajes de WhatsApp"
                    description="Lo que se escribe solo al dar clic en los botones de WhatsApp de la agenda. Las palabras entre llaves se cambian por los datos de cada clase."
                />

                <form onSubmit={submit} className="grid gap-6">
                    {(Object.keys(META) as TemplateKey[]).map((key) => (
                        <TemplateEditor
                            key={key}
                            id={key}
                            title={META[key].title}
                            description={META[key].description}
                            value={data[key]}
                            onChange={(v) => setData(key, v)}
                            onReset={() => setData(key, defaults[key])}
                            isDefault={data[key] === defaults[key]}
                            preview={render(data[key])}
                            variables={variables}
                            error={errors[key]}
                        />
                    ))}

                    <div className="bg-background/90 sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
                        {recentlySuccessful && (
                            <span className="text-sm font-semibold text-emerald-600">
                                <Check className="inline size-4" /> Guardado
                            </span>
                        )}
                        <Button type="submit" disabled={processing || !isDirty} className="rounded-full px-6">
                            {processing ? <LoaderCircle className="animate-spin" /> : <Save />}
                            Guardar mensajes
                        </Button>
                    </div>
                </form>
            </PageBody>
        </AppLayout>
    );
}

function TemplateEditor({
    id,
    title,
    description,
    value,
    onChange,
    onReset,
    isDefault,
    preview,
    variables,
    error,
}: {
    id: string;
    title: string;
    description: string;
    value: string;
    onChange: (v: string) => void;
    onReset: () => void;
    isDefault: boolean;
    preview: string;
    variables: string[];
    error?: string;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);

    // Inserta {variable} donde está el cursor
    const insert = (variable: string) => {
        const el = ref.current;
        const token = `{${variable}}`;
        if (!el) return onChange(value + token);
        const start = el.selectionStart ?? value.length;
        const end = el.selectionEnd ?? value.length;
        onChange(value.slice(0, start) + token + value.slice(end));
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start + token.length, start + token.length);
        });
    };

    return (
        <FormCard title={title} description={description}>
            <div className="grid gap-5 lg:grid-cols-2">
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor={`tpl-${id}`} className="font-semibold">
                            Mensaje
                        </Label>
                        {!isDefault && (
                            <button
                                type="button"
                                onClick={onReset}
                                className="text-muted-foreground inline-flex items-center gap-1 text-xs hover:underline"
                            >
                                <RotateCcw className="size-3" /> Usar el original
                            </button>
                        )}
                    </div>
                    <Textarea id={`tpl-${id}`} ref={ref} rows={5} value={value} onChange={(e) => onChange(e.target.value)} maxLength={1000} />
                    <div className="flex flex-wrap gap-1.5">
                        {variables.map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => insert(v)}
                                title={VARIABLE_HELP[v]}
                                className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-2.5 py-1 font-mono text-xs font-semibold"
                            >
                                {`{${v}}`}
                            </button>
                        ))}
                    </div>
                    <InputError message={error} />
                </div>

                <div>
                    <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-bold uppercase">
                        <WhatsAppIcon className="size-3.5" /> Así lo verá la familia
                    </p>
                    <div className="rounded-2xl bg-[#ECE5DD] p-4 dark:bg-neutral-800">
                        <div className="ml-auto max-w-[90%] rounded-xl rounded-tr-sm bg-[#DCF8C6] px-3 py-2 text-sm whitespace-pre-line text-neutral-900 shadow-sm">
                            {preview}
                        </div>
                    </div>
                </div>
            </div>
        </FormCard>
    );
}
