import { RainbowMark } from '@/components/brand/rainbow-mark';
import { WhatsAppButton } from '@/components/public/whatsapp-button';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type Service, type ServiceCategory } from '@/types/models';
import { ChevronDown, MapPin, Smile, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const categoryTone: Record<ServiceCategory, string> = {
    regularization: 'bg-brand-secondary-soft text-brand-secondary-strong',
    workshop: 'bg-brand-accent-soft text-brand-accent-strong',
    summer_course: 'bg-brand-primary-soft text-brand-primary-strong',
};

export function ServiceCard({ service }: { service: Service }) {
    const [expanded, setExpanded] = useState(false);
    const price = formatPrice(service.price);

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-xl hover:shadow-black/5"
        >
            <div className="bg-brand-primary-soft relative aspect-[4/3] overflow-hidden">
                {service.image_url ? (
                    <img
                        src={service.image_url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <RainbowMark className="h-16 opacity-70" />
                    </div>
                )}
                <span className={cn('absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm', categoryTone[service.category])}>
                    {service.category_label}
                </span>
                {service.is_featured && (
                    <span className="bg-brand-accent absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        <Star className="size-3 fill-current" /> Favorito
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="font-heading text-xl leading-snug font-bold">{service.title}</h3>
                <p className="text-brand-text/70 mt-2 text-sm leading-relaxed">{service.short_description}</p>

                <ul className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    {service.age_range && (
                        <li className="bg-brand-background inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                            <Smile className="size-3.5" /> {service.age_range}
                        </li>
                    )}
                    <li className="bg-brand-background inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                        <MapPin className="size-3.5" /> {service.modality_label}
                    </li>
                </ul>

                {service.description && (
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            aria-expanded={expanded}
                            className="text-brand-secondary-strong inline-flex items-center gap-1 text-sm font-bold hover:underline"
                        >
                            {expanded ? 'Ver menos' : 'Ver más detalles'}
                            <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
                        </button>
                        {expanded && <p className="text-brand-text/70 mt-2 text-sm leading-relaxed whitespace-pre-line">{service.description}</p>}
                    </div>
                )}

                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    {price ? (
                        <p className="leading-tight">
                            <span className="font-heading text-brand-primary-strong text-2xl font-bold">{price}</span>
                            {service.price_note && <span className="text-brand-text/60 block text-xs">{service.price_note}</span>}
                        </p>
                    ) : (
                        <span />
                    )}
                    {service.whatsapp_url && (
                        <WhatsAppButton href={service.whatsapp_url} variant="soft" className="shrink-0">
                            Me interesa
                        </WhatsAppButton>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
