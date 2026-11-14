import { SectionHeading } from '@/components/public/section-heading';
import { dateBadge } from '@/lib/format';
import { type SiteEvent } from '@/types/models';
import { Clock, MapPin, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';

export function EventsSection({ events }: { events: SiteEvent[] }) {
    if (events.length === 0) {
        return null;
    }

    return (
        <section id="eventos" className="from-brand-secondary-soft/60 scroll-mt-24 bg-gradient-to-b to-transparent py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading eyebrow="No te lo pierdas" title="Próximos eventos y avisos" />

                <ul className="grid gap-5 md:grid-cols-2">
                    {events.map((event, i) => (
                        <motion.li
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: (i % 2) * 0.1, duration: 0.45 }}
                            className="flex gap-4 overflow-hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
                        >
                            <DateTile date={event.event_date} />

                            <div className="min-w-0 flex-1">
                                <h3 className="font-heading text-lg leading-snug font-bold">{event.title}</h3>
                                {(event.time_label || event.location) && (
                                    <p className="text-brand-text/60 mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                                        {event.date_label && <span className="inline-block first-letter:uppercase">{event.date_label}</span>}
                                        {event.time_label && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="size-3.5" /> {event.time_label}
                                            </span>
                                        )}
                                        {event.location && (
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="size-3.5" /> {event.location}
                                            </span>
                                        )}
                                    </p>
                                )}
                                <p className="text-brand-text/75 mt-2 text-sm leading-relaxed whitespace-pre-line">{event.body}</p>
                            </div>

                            {event.image_url && (
                                <img
                                    src={event.image_url}
                                    alt=""
                                    loading="lazy"
                                    className="hidden size-24 shrink-0 rounded-2xl object-cover sm:block"
                                />
                            )}
                        </motion.li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

function DateTile({ date }: { date: string | null }) {
    if (!date) {
        return (
            <span className="bg-brand-accent-soft text-brand-accent-strong flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl">
                <Megaphone className="size-6" />
                <span className="mt-0.5 text-[0.6rem] font-bold tracking-wider uppercase">Aviso</span>
            </span>
        );
    }

    const { day, month } = dateBadge(date);

    return (
        <span className="bg-brand-primary-soft text-brand-primary-strong flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl">
            <span className="font-heading text-2xl leading-none font-bold">{day}</span>
            <span className="mt-1 text-xs font-bold uppercase">{month}</span>
        </span>
    );
}
