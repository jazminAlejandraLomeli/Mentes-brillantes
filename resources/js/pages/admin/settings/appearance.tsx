import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { FormCard, FormField } from '@/components/admin/form-field';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { BrandMark } from '@/components/brand/brand-logo';
import { RainbowMark } from '@/components/brand/rainbow-mark';
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import AppLayout from '@/layouts/app-layout';
import { isHex, mix, readableOnWhite } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { type SharedData, type ThemeSettings } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, ImagePlus, LoaderCircle, RotateCcw, Save, Trash2 } from 'lucide-react';
import { type CSSProperties, type FormEventHandler, useEffect } from 'react';

interface FontOption {
    value: string;
    label: string;
    style: string;
    google: string;
}

interface Preset {
    key: string;
    label: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

interface Props {
    current: ThemeSettings;
    defaults: ThemeSettings;
    fonts: FontOption[];
    presets: Preset[];
}

const COLOR_FIELDS: { key: keyof ThemeSettings; label: string; hint: string }[] = [
    { key: 'primary', label: 'Principal', hint: 'Botones y títulos destacados' },
    { key: 'secondary', label: 'Secundario', hint: 'Etiquetas e iconos' },
    { key: 'accent', label: 'Acento', hint: 'Estrellitas y avisos' },
    { key: 'background', label: 'Fondo', hint: 'Color de fondo de la página' },
    { key: 'text', label: 'Texto', hint: 'Color de las letras' },
];

export default function Appearance({ current, fonts, presets }: Props) {
    const { site } = usePage<SharedData>().props;
    const { data, setData, put, processing, errors, isDirty, recentlySuccessful } = useForm<ThemeSettings>({ ...current });

    // Carga todas las fuentes para poder previsualizarlas
    useEffect(() => {
        const id = 'theme-font-preview';
        if (document.getElementById(id)) return;
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?${fonts.map((f) => `family=${f.google}`).join('&')}&display=swap`;
        document.head.appendChild(link);
    }, [fonts]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.settings.appearance.update'), { preserveScroll: true });
    };

    const applyPreset = (p: Preset) =>
        setData((d) => ({ ...d, primary: p.primary, secondary: p.secondary, accent: p.accent, background: p.background, text: p.text }));

    const activePreset = presets.find((p) =>
        COLOR_FIELDS.every(({ key }) => (p[key as keyof Preset] as string).toUpperCase() === (data[key] as string).toUpperCase()),
    );
    const fontLabel = (key: string) => fonts.find((f) => f.value === key)?.label ?? 'sans-serif';

    // Variables CSS de la vista previa (las mismas que usa la página real)
    const safe = (v: string, fallback: string) => (isHex(v) ? v : fallback);
    const primary = safe(data.primary, current.primary);
    const secondary = safe(data.secondary, current.secondary);
    const accent = safe(data.accent, current.accent);
    const previewVars = {
        '--brand-primary': primary,
        '--brand-primary-strong': readableOnWhite(primary),
        '--brand-primary-soft': mix(primary, '#FFFFFF', 0.82),
        '--brand-secondary': secondary,
        '--brand-secondary-strong': readableOnWhite(secondary),
        '--brand-secondary-soft': mix(secondary, '#FFFFFF', 0.82),
        '--brand-accent': accent,
        '--brand-accent-strong': readableOnWhite(accent),
        '--brand-accent-soft': mix(accent, '#FFFFFF', 0.8),
        '--brand-background': safe(data.background, current.background),
        '--brand-text': safe(data.text, current.text),
        '--brand-font-heading': `'${fontLabel(data.heading_font)}', sans-serif`,
        '--brand-font-body': `'${fontLabel(data.body_font)}', sans-serif`,
    } as CSSProperties;

    return (
        <AppLayout breadcrumbs={[{ title: 'Colores, letras y logo', href: route('admin.settings.appearance') }]}>
            <Head title="Colores, letras y logo" />
            <PageBody>
                <PageHeader
                    title="Colores, letras y logo"
                    description="Cambia cómo se ve tu página. A la derecha ves cómo va quedando antes de guardar."
                    actions={
                        <ConfirmDelete
                            url={route('admin.settings.appearance.reset')}
                            title="¿Regresar a los colores originales?"
                            description="Se restaurará la combinación «Arcoíris» con las letras Quicksand y Nunito."
                            confirmLabel="Sí, restaurar"
                            trigger={
                                <Button variant="outline" className="rounded-full">
                                    <RotateCcw /> Colores originales
                                </Button>
                            }
                        />
                    }
                />

                <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_420px]">
                    <div className="grid content-start gap-6">
                        <LogoCard />
                        <FormCard title="Combinaciones pastel" description="Elige una con un clic y, si quieres, ajusta los colores abajo.">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {presets.map((p) => (
                                    <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className={cn(
                                            'relative rounded-2xl border p-3 text-left transition hover:shadow-md',
                                            activePreset?.key === p.key && 'border-primary ring-primary/30 ring-2',
                                        )}
                                        style={{ background: p.background }}
                                    >
                                        <div className="mb-2 flex gap-1">
                                            {[p.primary, p.secondary, p.accent].map((c) => (
                                                <span key={c} className="size-6 rounded-full ring-2 ring-white" style={{ background: c }} />
                                            ))}
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: p.text }}>
                                            {p.label}
                                        </span>
                                        {activePreset?.key === p.key && <Check className="text-primary absolute top-2 right-2 size-4" />}
                                    </button>
                                ))}
                            </div>
                        </FormCard>

                        <FormCard title="Colores">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {COLOR_FIELDS.map(({ key, label, hint }) => (
                                    <FormField key={key} label={label} htmlFor={`color-${key}`} hint={hint} error={errors[key]}>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                aria-label={`Elegir color ${label.toLowerCase()}`}
                                                value={isHex(data[key]) ? data[key] : '#000000'}
                                                onChange={(e) => setData(key, e.target.value.toUpperCase())}
                                                className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
                                            />
                                            <Input
                                                id={`color-${key}`}
                                                value={data[key]}
                                                onChange={(e) => setData(key, e.target.value)}
                                                maxLength={7}
                                                className="font-mono uppercase"
                                            />
                                        </div>
                                    </FormField>
                                ))}
                            </div>
                        </FormCard>

                        <FormCard title="Tipos de letra">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FontPicker
                                    id="heading_font"
                                    label="Títulos"
                                    value={data.heading_font}
                                    fonts={fonts}
                                    onChange={(v) => setData('heading_font', v)}
                                    error={errors.heading_font}
                                    sample="Clases que brillan"
                                />
                                <FontPicker
                                    id="body_font"
                                    label="Textos"
                                    value={data.body_font}
                                    fonts={fonts}
                                    onChange={(v) => setData('body_font', v)}
                                    error={errors.body_font}
                                    sample="Apoyo escolar personalizado para tu peque."
                                />
                            </div>
                        </FormCard>
                    </div>

                    {/* Vista previa */}
                    <div className="xl:sticky xl:top-4 xl:self-start">
                        <p className="text-muted-foreground mb-2 text-xs font-bold uppercase">Vista previa</p>
                        <div
                            style={previewVars}
                            className="bg-brand-background text-brand-text font-body overflow-hidden rounded-3xl border shadow-lg"
                        >
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="flex items-center gap-2">
                                    <BrandMark className="h-5 w-auto max-w-24" />
                                    <span className="font-heading text-brand-primary-strong text-sm font-bold">{site.business.name}</span>
                                </span>
                                <span className="bg-brand-primary-strong rounded-full px-3 py-1 text-[0.65rem] font-bold text-white">
                                    Agenda una clase
                                </span>
                            </div>
                            <div className="px-5 pt-4 pb-6 text-center">
                                <p className="text-brand-secondary-strong text-[0.6rem] font-bold tracking-widest uppercase">
                                    Regularización · Talleres
                                </p>
                                <p className="font-heading mt-1 text-2xl leading-tight font-bold">
                                    Clases que hacen <span className="text-brand-primary-strong">brillar</span> a tu peque
                                </p>
                                <p className="text-brand-text/70 mt-2 text-xs">Apoyo escolar personalizado con juegos y dinámicas.</p>
                                <span className="bg-brand-primary-strong mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white">
                                    <WhatsAppIcon className="size-3.5" /> ¡Quiero informes!
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 px-4 pb-5">
                                {['Regularización', 'Taller'].map((label, i) => (
                                    <div key={label} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                                        <div
                                            className={cn(
                                                'flex h-14 items-center justify-center',
                                                i === 0 ? 'bg-brand-primary-soft' : 'bg-brand-accent-soft',
                                            )}
                                        >
                                            <RainbowMark className="h-6" />
                                        </div>
                                        <div className="p-2.5">
                                            <span
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-[0.55rem] font-bold',
                                                    i === 0
                                                        ? 'bg-brand-secondary-soft text-brand-secondary-strong'
                                                        : 'bg-brand-accent-soft text-brand-accent-strong',
                                                )}
                                            >
                                                {label}
                                            </span>
                                            <p className="font-heading mt-1.5 text-xs font-bold">{i === 0 ? 'Primaria' : 'Manualidades'}</p>
                                            <p className="font-heading text-brand-primary-strong mt-1 text-sm font-bold">
                                                {i === 0 ? '$250' : '$180'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-3">
                            {recentlySuccessful && (
                                <span className="text-sm font-semibold text-emerald-600">
                                    <Check className="inline size-4" /> Guardado
                                </span>
                            )}
                            <Button type="submit" disabled={processing || !isDirty} className="rounded-full px-6">
                                {processing ? <LoaderCircle className="animate-spin" /> : <Save />}
                                Guardar cambios
                            </Button>
                        </div>
                    </div>
                </form>
            </PageBody>
        </AppLayout>
    );
}

function FontPicker({
    id,
    label,
    value,
    fonts,
    onChange,
    error,
    sample,
}: {
    id: string;
    label: string;
    value: string;
    fonts: FontOption[];
    onChange: (v: string) => void;
    error?: string;
    sample: string;
}) {
    const font = fonts.find((f) => f.value === value);

    return (
        <div className="grid gap-2">
            <FormField label={label} htmlFor={id}>
                <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
                    {fonts.map((f) => (
                        <option key={f.value} value={f.value}>
                            {f.label} — {f.style}
                        </option>
                    ))}
                </NativeSelect>
            </FormField>
            <p className="bg-muted rounded-xl px-3 py-3 text-lg" style={{ fontFamily: `'${font?.label}', sans-serif` }}>
                {sample}
            </p>
            <InputError message={error} />
        </div>
    );
}

/**
 * Logo del negocio. Se guarda al instante (no depende del botón "Guardar cambios").
 */
function LogoCard() {
    const { brand, site } = usePage<SharedData>().props;
    const { post, processing, errors, reset, progress, transform } = useForm<{ logo: File | null }>({ logo: null });

    const upload = (file: File | undefined) => {
        if (!file) return;
        // El archivo se pone justo al enviar (sin esperar a que el formulario se actualice)
        transform(() => ({ logo: file }));
        post(route('admin.settings.logo.update'), { forceFormData: true, preserveScroll: true, onFinish: () => reset() });
    };

    return (
        <FormCard title="Logo" description="Aparece arriba de tu página, en el panel y como icono de la pestaña del navegador.">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="bg-muted flex h-28 w-full shrink-0 items-center justify-center rounded-2xl border p-3 sm:w-48">
                    {brand.logo_url ? (
                        <img src={brand.logo_url} alt={`Logo de ${site.business.name}`} className="max-h-full max-w-full object-contain" />
                    ) : (
                        <span className="text-muted-foreground text-center text-xs">Sin logo: se usa el arcoíris</span>
                    )}
                </div>
                <div className="grid gap-2">
                    <div className="flex flex-wrap gap-2">
                        <label className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
                            {processing ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                            {processing && progress ? `Subiendo ${progress.percentage}%` : brand.logo_url ? 'Cambiar logo' : 'Subir logo'}
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="sr-only"
                                disabled={processing}
                                onChange={(e) => upload(e.target.files?.[0])}
                            />
                        </label>
                        {brand.logo_url && (
                            <ConfirmDelete
                                url={route('admin.settings.logo.remove')}
                                title="¿Quitar el logo?"
                                description="La página volverá a mostrar el arcoíris y el nombre."
                                confirmLabel="Sí, quitarlo"
                                trigger={
                                    <Button variant="ghost" size="sm" className="rounded-full text-red-600 hover:bg-red-50">
                                        <Trash2 /> Quitar
                                    </Button>
                                }
                            />
                        )}
                    </div>
                    <p className="text-muted-foreground text-xs">PNG con fondo transparente se ve mejor · máximo 4 MB.</p>
                    <InputError message={errors.logo} />
                </div>
            </div>
        </FormCard>
    );
}
