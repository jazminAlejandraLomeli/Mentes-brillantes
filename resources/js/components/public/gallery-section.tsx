import { SectionHeading } from '@/components/public/section-heading';
import { cn } from '@/lib/utils';
import { type GalleryItem } from '@/types/models';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function GallerySection({ items }: { items: GalleryItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (items.length === 0) {
        return null;
    }

    return (
        <section id="galeria" className="scroll-mt-24 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    eyebrow="Así trabajamos"
                    title="Nuestras actividades"
                    description="Un vistazo a lo que aprendemos y creamos en clase."
                />

                {/* Cuadrícula fija: 2 por fila en celular, 3 en tablet y 4 en computadora */}
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {items.map((item, i) => (
                        <motion.li
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                        >
                            <button
                                type="button"
                                onClick={() => setOpenIndex(i)}
                                className="group focus-visible:ring-brand-primary relative block aspect-square w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 focus-visible:ring-4 focus-visible:outline-none"
                                aria-label={item.caption ? `Ver foto: ${item.caption}` : 'Ver foto'}
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.caption ?? ''}
                                    loading="lazy"
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute top-2 right-2 rounded-full bg-white/85 p-1.5 text-neutral-700 opacity-0 shadow transition-opacity group-hover:opacity-100">
                                    <Expand className="size-4" />
                                </span>
                                {item.caption && (
                                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 pt-10 text-left text-xs font-semibold text-white sm:text-sm">
                                        <span className="line-clamp-2">{item.caption}</span>
                                    </span>
                                )}
                            </button>
                        </motion.li>
                    ))}
                </ul>
            </div>

            <Lightbox items={items} index={openIndex} onIndexChange={setOpenIndex} />
        </section>
    );
}

/**
 * Visor de fotos a pantalla completa: la foto ocupa casi toda la pantalla,
 * con el texto debajo, flechas, deslizar con el dedo y miniaturas.
 */
function Lightbox({ items, index, onIndexChange }: { items: GalleryItem[]; index: number | null; onIndexChange: (i: number | null) => void }) {
    const reduceMotion = useReducedMotion();
    const [direction, setDirection] = useState(0);
    const touchStart = useRef<number | null>(null);
    const current = index === null ? null : items[index];
    const many = items.length > 1;

    const step = useCallback(
        (delta: number) => {
            if (index === null) return;
            setDirection(delta);
            onIndexChange((index + delta + items.length) % items.length);
        },
        [index, items.length, onIndexChange],
    );

    useEffect(() => {
        if (index === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') step(1);
            if (e.key === 'ArrowLeft') step(-1);
        };
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [index, step]);

    return (
        <DialogPrimitive.Root open={current !== null} onOpenChange={(open) => !open && onIndexChange(null)}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-neutral-950/92 backdrop-blur-sm" />
                <DialogPrimitive.Content
                    className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 flex flex-col outline-none"
                    onClick={(e) => {
                        // Clic en el fondo (fuera de la foto) también cierra
                        if (e.target === e.currentTarget) onIndexChange(null);
                    }}
                    onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                        if (touchStart.current === null) return;
                        const delta = e.changedTouches[0].clientX - touchStart.current;
                        if (many && Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
                        touchStart.current = null;
                    }}
                >
                    {current && index !== null && (
                        <>
                            <DialogPrimitive.Title className="sr-only">{current.caption || 'Foto de actividades'}</DialogPrimitive.Title>
                            <DialogPrimitive.Description className="sr-only">
                                Foto {index + 1} de {items.length}. Usa las flechas o desliza para ver las demás.
                            </DialogPrimitive.Description>

                            {/* Barra superior: contador y cerrar */}
                            <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white sm:px-6">
                                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold tabular-nums">
                                    {index + 1} / {items.length}
                                </span>
                                <DialogPrimitive.Close
                                    className="rounded-full bg-white/10 p-2.5 transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                                    aria-label="Cerrar"
                                >
                                    <X className="size-5" />
                                </DialogPrimitive.Close>
                            </div>

                            {/* Foto + texto */}
                            <div
                                className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 sm:px-20"
                                onClick={(e) => e.target === e.currentTarget && onIndexChange(null)}
                            >
                                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                                    <motion.figure
                                        key={current.id}
                                        custom={direction}
                                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * 60 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * -60 }}
                                        transition={{ duration: 0.25, ease: 'easeOut' }}
                                        className="flex max-h-full min-h-0 max-w-5xl flex-col items-center"
                                    >
                                        <img
                                            src={current.image_url}
                                            alt={current.caption ?? ''}
                                            className="max-h-[calc(100dvh-13rem)] w-auto max-w-full rounded-2xl object-contain shadow-2xl sm:max-h-[calc(100dvh-14rem)]"
                                        />
                                        {current.caption && (
                                            <figcaption className="font-heading mt-4 max-w-2xl px-2 text-center text-lg leading-snug font-semibold text-balance text-white sm:text-xl">
                                                {current.caption}
                                            </figcaption>
                                        )}
                                    </motion.figure>
                                </AnimatePresence>

                                {many && (
                                    <>
                                        <NavButton side="left" onClick={() => step(-1)} />
                                        <NavButton side="right" onClick={() => step(1)} />
                                    </>
                                )}
                            </div>

                            {/* Miniaturas */}
                            {many && (
                                <div className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 py-4">
                                    {items.map((item, i) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                setDirection(i > index ? 1 : -1);
                                                onIndexChange(i);
                                            }}
                                            aria-label={`Ver foto ${i + 1}`}
                                            aria-current={i === index}
                                            className={cn(
                                                'size-12 shrink-0 overflow-hidden rounded-lg transition sm:size-14',
                                                i === index ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-90',
                                            )}
                                        >
                                            <img src={item.image_url} alt="" className="size-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

function NavButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
    const Icon = side === 'left' ? ChevronLeft : ChevronRight;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={side === 'left' ? 'Foto anterior' : 'Foto siguiente'}
            className={cn(
                'absolute top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:block',
                side === 'left' ? 'left-4' : 'right-4',
            )}
        >
            <Icon className="size-6" />
        </button>
    );
}
