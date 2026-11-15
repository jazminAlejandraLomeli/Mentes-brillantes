import { BrandMark } from '@/components/brand/brand-logo';
import { WhatsAppButton } from '@/components/public/whatsapp-button';
import { type SiteConfig } from '@/types';
import { ArrowDown } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Fragment } from 'react';

type Hero = NonNullable<SiteConfig['hero']>;

/**
 * Frase de bienvenida arriba del carrusel: lo primero que ve un papá al
 * abrir la página. El texto se edita en config/site.json → "hero".
 */
export function HeroIntro({ hero, contactUrl, hasServices }: { hero: Hero; contactUrl: string; hasServices: boolean }) {
    const reduceMotion = useReducedMotion();
    const appear = (delay: number) => ({
        initial: reduceMotion ? false : { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: 0.55, ease: 'easeOut' as const },
    });

    return (
        <section className="relative mx-auto max-w-4xl px-4 pt-8 pb-10 text-center sm:px-6 sm:pt-14 sm:pb-14">
            {/* Burbujas pastel decorativas */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
                <span className="bg-brand-primary-soft absolute top-12 left-6 size-24 rounded-full opacity-80 blur-3xl sm:left-10 sm:size-40" />
                <span className="bg-brand-secondary-soft absolute right-6 bottom-12 size-28 rounded-full opacity-80 blur-3xl sm:right-10 sm:size-44" />
                <span className="bg-brand-accent-soft absolute top-1/3 right-1/4 size-16 rounded-full opacity-70 blur-3xl" />
            </div>

            <div className="relative">
                <motion.div {...appear(0)}>
                    <BrandMark className="mx-auto mb-4 h-10 w-auto sm:h-12" />
                </motion.div>

                {hero.eyebrow && (
                    <motion.p {...appear(0.08)} className="text-brand-secondary-strong mb-3 text-xs font-bold tracking-[0.16em] uppercase sm:text-sm">
                        {hero.eyebrow}
                    </motion.p>
                )}

                <motion.h1
                    {...appear(0.16)}
                    className="font-heading text-brand-text text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-6xl"
                >
                    <Highlighted text={hero.title} />
                </motion.h1>

                {hero.subtitle && (
                    <motion.p {...appear(0.26)} className="text-brand-text/70 mx-auto mt-5 max-w-2xl text-base text-pretty sm:text-xl">
                        {hero.subtitle}
                    </motion.p>
                )}

                <motion.div {...appear(0.36)} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <WhatsAppButton href={contactUrl} size="lg">
                        Agenda una clase
                    </WhatsAppButton>
                    {hasServices && (
                        <a
                            href="#servicios"
                            className="text-brand-text hover:bg-brand-primary-soft inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-bold shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5"
                        >
                            Ver clases y cursos
                            <ArrowDown className="size-4" />
                        </a>
                    )}
                </motion.div>
            </div>
        </section>
    );
}

/** "Clases que hacen *brillar* a tu peque" → "brillar" con subrayado de color. */
function Highlighted({ text }: { text: string }) {
    const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);

    return (
        <>
            {parts.map((part, i) =>
                part.startsWith('*') && part.endsWith('*') ? (
                    <span key={i} className="text-brand-primary-strong relative inline-block whitespace-nowrap">
                        {part.slice(1, -1)}
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 200 12"
                            preserveAspectRatio="none"
                            className="stroke-brand-accent absolute -bottom-1 left-0 h-2.5 w-full sm:-bottom-2 sm:h-3.5"
                        >
                            <path d="M2 9 C 50 2, 150 2, 198 8" fill="none" strokeWidth="5" strokeLinecap="round" />
                        </svg>
                    </span>
                ) : (
                    <Fragment key={i}>{part}</Fragment>
                ),
            )}
        </>
    );
}
