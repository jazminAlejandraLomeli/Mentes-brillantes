import { WhatsAppButton } from '@/components/public/whatsapp-button';
import { isExternal } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type Banner } from '@/types/models';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface HeroCarouselProps {
    banners: Banner[];
    contactUrl: string;
}

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ banners, contactUrl }: HeroCarouselProps) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const reduceMotion = useReducedMotion();
    const touchStart = useRef<number | null>(null);
    const count = banners.length;

    const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

    useEffect(() => {
        if (count < 2 || paused || reduceMotion) {
            return;
        }

        const timer = window.setTimeout(() => go(index + 1), AUTOPLAY_MS);

        return () => window.clearTimeout(timer);
    }, [index, count, paused, reduceMotion, go]);

    // Sin banners no se muestra nada: la frase de bienvenida ya ocupa ese lugar
    if (count === 0) {
        return null;
    }

    const banner = banners[index];
    const ctaUrl = banner.cta_url || contactUrl;
    const ctaLabel = banner.cta_label || '¡Quiero informes!';

    return (
        <section
            aria-roledescription="carrusel"
            aria-label="Promociones"
            className="relative mx-auto max-w-6xl px-4 sm:px-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
                if (touchStart.current === null) return;
                const delta = e.changedTouches[0].clientX - touchStart.current;
                if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
                touchStart.current = null;
            }}
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl shadow-black/10 sm:aspect-[16/9] lg:aspect-[16/7]">
                <AnimatePresence initial={false} mode="popLayout">
                    <motion.div
                        key={banner.id}
                        initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="absolute inset-0"
                    >
                        {banner.image_url && (
                            <img
                                src={banner.image_url}
                                alt=""
                                className="size-full object-cover"
                                loading={index === 0 ? 'eager' : 'lazy'}
                                fetchPriority={index === 0 ? 'high' : 'auto'}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent sm:bg-gradient-to-r sm:from-black/60 sm:via-black/25 " />

                        <div
                            role="group"
                            aria-roledescription="diapositiva"
                            aria-label={`${index + 1} de ${count}`}
                            className="absolute  inset-x-0 bottom-0 p-6 pb-14 sm:top-0 sm:flex sm:max-w-xl sm:flex-col sm:justify-center sm:p-12"
                        >
                            <motion.h2
                                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.5 }}
                                className="font-heading pl-6 text-3xl leading-tight font-bold text-balance text-white drop-shadow sm:text-5xl"
                            >
                                {banner.title}
                            </motion.h2>
                            {banner.subtitle && (
                                <motion.p
                                    initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25, duration: 0.5 }}
                                    className="mt-3 pl-6 text-base text-pretty text-white/90 sm:text-lg"
                                >
                                    {banner.subtitle}
                                </motion.p>
                            )}
                            <motion.div
                                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35, duration: 0.5 }}
                                className="mt-6 pl-6"
                            >
                                {isExternal(ctaUrl) && /wa\.me|api\.whatsapp\.com/.test(ctaUrl) ? (
                                    <WhatsAppButton href={ctaUrl} variant="white" size="lg">
                                        {ctaLabel}
                                    </WhatsAppButton>
                                ) : (
                                    <a
                                        href={ctaUrl}
                                        {...(isExternal(ctaUrl) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                        className="text-brand-primary-strong hover:bg-brand-primary-soft inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold shadow-lg transition-all hover:-translate-y-0.5"
                                    >
                                        {ctaLabel}
                                        <ArrowRight className="size-5" />
                                    </a>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {count > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => go(index - 1)}
                            aria-label="Anterior"
                            className="text-brand-text absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur transition hover:bg-white sm:block"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => go(index + 1)}
                            aria-label="Siguiente"
                            className="text-brand-text absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow backdrop-blur transition hover:bg-white sm:block"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
                            {banners.map((b, i) => (
                                <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => go(i)}
                                    aria-label={`Ver promoción ${i + 1}`}
                                    aria-current={i === index}
                                    className={cn(
                                        'h-2.5 rounded-full transition-all duration-300',
                                        i === index ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80',
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
