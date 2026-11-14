import { SectionHeading } from '@/components/public/section-heading';
import { ServiceCard } from '@/components/public/service-card';
import { cn } from '@/lib/utils';
import { type Option, type Service } from '@/types/models';
import { AnimatePresence } from 'motion/react';
import { useMemo, useState } from 'react';

interface ServicesSectionProps {
    services: Service[];
    categories: Option[];
}

export function ServicesSection({ services, categories }: ServicesSectionProps) {
    const [category, setCategory] = useState<string>('all');

    // Solo se muestran las pestañas que tienen servicios
    const tabs = useMemo(
        () => [{ value: 'all', label: 'Todos' }, ...categories.filter((c) => services.some((s) => s.category === c.value))],
        [categories, services],
    );

    const visible = category === 'all' ? services : services.filter((s) => s.category === category);

    if (services.length === 0) {
        return null;
    }

    return (
        <section id="servicios" className="scroll-mt-24 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionHeading
                    eyebrow="Clases y cursos"
                    title="¿En qué podemos ayudar a tu peque?"
                    description="Regularización, talleres y cursos de verano pensados para que aprender sea divertido."
                />

                {tabs.length > 2 && (
                    <div role="tablist" aria-label="Filtrar por tipo" className="mb-8 flex flex-wrap justify-center gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                role="tab"
                                aria-selected={category === tab.value}
                                onClick={() => setCategory(tab.value)}
                                className={cn(
                                    'rounded-full px-4 py-2 text-sm font-bold transition-all',
                                    category === tab.value
                                        ? 'bg-brand-primary-strong text-white shadow-md'
                                        : 'text-brand-text/70 hover:bg-brand-primary-soft hover:text-brand-primary-strong bg-white ring-1 ring-black/5',
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {visible.map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
