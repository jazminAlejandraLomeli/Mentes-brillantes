import { SectionHeading } from '@/components/public/section-heading';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { type GalleryItem } from '@/types/models';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

export function GallerySection({ items }: { items: GalleryItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const current = openIndex === null ? null : items[openIndex];

    const step = useCallback((delta: number) => setOpenIndex((i) => (i === null ? null : (i + delta + items.length) % items.length)), [items.length]);

    useEffect(() => {
        if (openIndex === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') step(1);
            if (e.key === 'ArrowLeft') step(-1);
        };
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [openIndex, step]);

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

                <ul className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
                    {items.map((item, i) => (
                        <motion.li
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                            className="mb-3 break-inside-avoid sm:mb-4"
                        >
                            <button
                                type="button"
                                onClick={() => setOpenIndex(i)}
                                className="group focus-visible:ring-brand-primary relative block w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 focus-visible:ring-4 focus-visible:outline-none"
                                aria-label={item.caption ? `Ver foto: ${item.caption}` : 'Ver foto'}
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.caption ?? ''}
                                    loading="lazy"
                                    className="w-full transition-transform duration-500 group-hover:scale-105"
                                />
                                {item.caption && (
                                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-left text-xs font-semibold text-white opacity-100 transition-opacity sm:text-sm sm:opacity-0 sm:group-hover:opacity-100">
                                        {item.caption}
                                    </span>
                                )}
                            </button>
                        </motion.li>
                    ))}
                </ul>
            </div>

            <Dialog open={current !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
                <DialogContent className="max-w-4xl overflow-hidden rounded-3xl border-0 bg-white p-0 sm:max-w-4xl">
                    {current && (
                        <figure>
                            <DialogTitle className="sr-only">{current.caption || 'Foto de actividades'}</DialogTitle>
                            <DialogDescription className="sr-only">
                                Foto {(openIndex ?? 0) + 1} de {items.length}. Usa las flechas para ver las demás.
                            </DialogDescription>
                            <div className="relative bg-black/5">
                                <img src={current.image_url} alt={current.caption ?? ''} className="max-h-[75vh] w-full object-contain" />
                                {items.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => step(-1)}
                                            aria-label="Foto anterior"
                                            className="text-brand-text absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow hover:bg-white"
                                        >
                                            <ChevronLeft className="size-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => step(1)}
                                            aria-label="Foto siguiente"
                                            className="text-brand-text absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow hover:bg-white"
                                        >
                                            <ChevronRight className="size-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                            {current.caption && (
                                <figcaption className="text-brand-text px-5 py-4 text-sm font-semibold">{current.caption}</figcaption>
                            )}
                        </figure>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
