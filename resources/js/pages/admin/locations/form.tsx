import { FormActions } from '@/components/admin/form-actions';
import { FormCard, FormField } from '@/components/admin/form-field';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { SwitchField } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type Location } from '@/types/admin';
import { Head, useForm } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { type FormEventHandler, useEffect, useState } from 'react';

type LocationForm = {
    name: string;
    address: string;
    landmark: string;
    schedule: string;
    whatsapp_phone: string;
    maps_url: string;
    is_active: boolean;
};

const mapSearch = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const mapEmbed = (address: string) => `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`;

export default function LocationFormPage({ location }: { location: Location | null }) {
    const editing = location !== null;

    const { data, setData, post, put, processing, errors } = useForm<LocationForm>({
        name: location?.name ?? '',
        address: location?.address ?? '',
        landmark: location?.landmark ?? '',
        schedule: location?.schedule ?? '',
        whatsapp_phone: location?.whatsapp_phone ?? '',
        maps_url: location?.maps_url ?? '',
        is_active: location?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (editing) {
            put(route('admin.locations.update', location.id));
        } else {
            post(route('admin.locations.store'));
        }
    };

    const title = editing ? `Editar ${location.name || 'sucursal'}` : 'Nueva sucursal';
    // El mapa se actualiza cuando deja de escribir (no con cada letra)
    const [address, setAddress] = useState(data.address.trim());
    useEffect(() => {
        const timer = setTimeout(() => setAddress(data.address.trim()), 700);
        return () => clearTimeout(timer);
    }, [data.address]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Sucursales', href: route('admin.locations.index') },
                { title, href: '#' },
            ]}
        >
            <Head title={title} />
            <PageBody>
                <PageHeader title={title} description="Así aparecerá en la sección «Visítanos» de la página." />

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
                    <div className="grid content-start gap-6">
                        <FormCard title="¿Dónde está?">
                            <FormField
                                label="Nombre"
                                htmlFor="name"
                                error={errors.name}
                                optional
                                hint="Útil si tienes más de un local. Si solo hay uno, déjalo vacío."
                            >
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Sucursal Centro"
                                    maxLength={120}
                                    autoFocus={!editing}
                                />
                            </FormField>
                            <FormField
                                label="Dirección"
                                htmlFor="address"
                                error={errors.address}
                                hint="Calle, número, colonia y ciudad. Con esto se arma el mapa."
                            >
                                <Textarea
                                    id="address"
                                    rows={2}
                                    maxLength={300}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Av. Juárez 123, Col. Centro, Tepatitlán de Morelos, Jal."
                                />
                            </FormField>
                            <FormField label="Referencias" htmlFor="landmark" error={errors.landmark} optional>
                                <Input
                                    id="landmark"
                                    value={data.landmark}
                                    onChange={(e) => setData('landmark', e.target.value)}
                                    placeholder="Frente a la plaza, segundo piso"
                                    maxLength={200}
                                />
                            </FormField>
                            <FormField label="Horario" htmlFor="schedule" error={errors.schedule} optional hint="Un horario por renglón.">
                                <Textarea
                                    id="schedule"
                                    rows={3}
                                    maxLength={1000}
                                    value={data.schedule}
                                    onChange={(e) => setData('schedule', e.target.value)}
                                    placeholder={'Lunes a viernes · 3:00 a 8:00 pm\nSábados · 9:00 am a 1:00 pm'}
                                />
                            </FormField>
                        </FormCard>

                        <FormCard title="Contacto y mapa">
                            <FormField
                                label="WhatsApp de esta sucursal"
                                htmlFor="whatsapp_phone"
                                error={errors.whatsapp_phone}
                                optional
                                hint="Solo si es distinto al número general del negocio."
                            >
                                <PhoneInput
                                    id="whatsapp_phone"
                                    value={data.whatsapp_phone}
                                    onChange={(digits) => setData('whatsapp_phone', digits)}
                                    invalid={Boolean(errors.whatsapp_phone)}
                                />
                            </FormField>
                            <FormField
                                label="Enlace de Google Maps"
                                htmlFor="maps_url"
                                error={errors.maps_url}
                                optional
                                hint="En Google Maps busca tu local → Compartir → Copiar vínculo. Si lo dejas vacío, el botón «Cómo llegar» busca la dirección."
                            >
                                <Input
                                    id="maps_url"
                                    type="url"
                                    inputMode="url"
                                    value={data.maps_url}
                                    onChange={(e) => setData('maps_url', e.target.value)}
                                    placeholder="https://maps.app.goo.gl/…"
                                    maxLength={500}
                                />
                            </FormField>
                        </FormCard>
                    </div>

                    <div className="grid content-start gap-6">
                        <FormCard title="Vista previa del mapa" description="Revisa que el punto caiga en tu local.">
                            {address.length > 8 ? (
                                <>
                                    <iframe
                                        key={address}
                                        title="Vista previa del mapa"
                                        src={mapEmbed(address)}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="bg-muted aspect-[4/3] w-full rounded-xl border-0"
                                    />
                                    <a
                                        href={data.maps_url.trim() || mapSearch(address)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                                    >
                                        Probar «Cómo llegar» <ExternalLink className="size-3.5" />
                                    </a>
                                    <p className="text-muted-foreground text-xs">
                                        Si el punto no cae exacto, agrega la colonia, la ciudad o el código postal a la dirección.
                                    </p>
                                </>
                            ) : (
                                <p className="text-muted-foreground bg-muted rounded-xl p-6 text-center text-sm">
                                    Escribe la dirección y aquí verás el mapa.
                                </p>
                            )}
                        </FormCard>

                        <FormCard title="Publicación">
                            <SwitchField
                                id="is_active"
                                label="Mostrar en la página"
                                description="Apágalo si cerró por un tiempo."
                                checked={data.is_active}
                                onCheckedChange={(v) => setData('is_active', v)}
                            />
                        </FormCard>
                    </div>

                    <div className="lg:col-span-2">
                        <FormActions cancelHref={route('admin.locations.index')} processing={processing} />
                    </div>
                </form>
            </PageBody>
        </AppLayout>
    );
}
