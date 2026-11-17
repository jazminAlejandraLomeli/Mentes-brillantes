import { SectionHeading } from '@/components/public/section-heading';
import { WhatsAppButton } from '@/components/public/whatsapp-button';
import { cn } from '@/lib/utils';
import { type Location } from '@/types/admin';
import { Clock, MapPin, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

/**
 * "Visítanos": dirección, horario y mapa de cada sucursal.
 * Con una sola sucursal se ve en grande (datos + mapa lado a lado);
 * con varias, en tarjetas.
 */
export function LocationsSection({ locations }: { locations: Location[] }) {
    if (locations.length === 0) {
        return null;
    }

    const single = locations.length === 1;

    return (
        <section id="visitanos" className="scroll-mt-24 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    eyebrow={single ? 'Visítanos' : 'Nuestras sucursales'}
                    title={single ? '¿Dónde estamos?' : 'Elige la más cercana'}
                    description={single ? undefined : 'Te esperamos en cualquiera de nuestros salones.'}
                />

                {single ? (
                    <LocationCard location={locations[0]} wide />
                ) : (
                    <ul className={cn('grid gap-6', locations.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3')}>
                        {locations.map((location, i) => (
                            <li key={location.id} className="min-w-0">
                                <LocationCard location={location} delay={(i % 3) * 0.1} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

function LocationCard({ location, wide = false, delay = 0 }: { location: Location; wide?: boolean; delay?: number }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay, duration: 0.45 }}
            className={cn(
                'flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5',
                wide && 'md:grid md:grid-cols-[1fr_1.25fr]',
            )}
        >
            <iframe
                title={`Mapa de ${location.name || 'la sucursal'}`}
                src={location.map_embed_url}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className={cn(
                    'bg-brand-primary-soft w-full border-0',
                    wide ? 'aspect-[4/3] md:order-2 md:aspect-auto md:h-full md:min-h-80' : 'aspect-video',
                )}
            />

            <div className={cn('flex flex-1 flex-col gap-4 p-5 sm:p-6', wide && 'md:justify-center md:p-8')}>
                <div className="flex items-start gap-3">
                    <span className="bg-brand-primary-soft text-brand-primary-strong flex size-11 shrink-0 items-center justify-center rounded-2xl">
                        <MapPin className="size-5" />
                    </span>
                    <div className="min-w-0">
                        {location.name && <h3 className="font-heading text-xl leading-snug font-bold">{location.name}</h3>}
                        <p className={cn('text-brand-text/80 leading-relaxed', !location.name && 'font-heading text-brand-text text-lg font-bold')}>
                            {location.address}
                        </p>
                        {location.landmark && <p className="text-brand-text/60 mt-0.5 text-sm">{location.landmark}</p>}
                    </div>
                </div>

                {location.schedule_list.length > 0 && (
                    <div className="bg-brand-accent-soft/60 flex items-start gap-3 rounded-2xl p-3">
                        <Clock className="text-brand-accent-strong mt-0.5 size-5 shrink-0" />
                        <ul className="text-brand-text/80 grid gap-0.5 text-sm">
                            {location.schedule_list.map((line) => (
                                <li key={line}>{line}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <a
                        href={location.directions_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-brand-secondary-soft text-brand-secondary-strong hover:bg-brand-secondary-strong inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors hover:text-white"
                    >
                        <Navigation className="size-4" /> Cómo llegar
                    </a>
                    {location.whatsapp_url && (
                        <WhatsAppButton href={location.whatsapp_url} variant="soft">
                            {location.whatsapp_phone_formatted}
                        </WhatsAppButton>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
