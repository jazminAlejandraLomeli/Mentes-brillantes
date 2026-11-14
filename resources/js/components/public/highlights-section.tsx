import { cn } from '@/lib/utils';
import { type SiteConfig } from '@/types';
import { BookOpen, Heart, MessageCircleHeart, Sparkles, Star, Users } from 'lucide-react';
import { motion } from 'motion/react';

type Highlight = NonNullable<SiteConfig['highlights']>[number];

const icons = { heart: Heart, sparkles: Sparkles, message: MessageCircleHeart, book: BookOpen, star: Star, users: Users };

// Cada tarjeta toma un color distinto del arcoíris
const tones = [
    'bg-brand-primary-soft text-brand-primary-strong',
    'bg-brand-secondary-soft text-brand-secondary-strong',
    'bg-brand-accent-soft text-brand-accent-strong',
];

export function HighlightsSection({ items }: { items: Highlight[] }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section aria-label="Por qué elegirnos" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <ul className="grid gap-4 sm:grid-cols-3 sm:gap-6">
                {items.map((item, i) => {
                    const Icon = icons[item.icon] ?? Star;

                    return (
                        <motion.li
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ delay: i * 0.1, duration: 0.45 }}
                            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
                        >
                            <span className={cn('mb-4 inline-flex size-12 items-center justify-center rounded-2xl', tones[i % tones.length])}>
                                <Icon className="size-6" />
                            </span>
                            <h3 className="font-heading text-lg font-bold">{item.title}</h3>
                            <p className="text-brand-text/70 mt-1.5 text-sm leading-relaxed">{item.text}</p>
                        </motion.li>
                    );
                })}
            </ul>
        </section>
    );
}
