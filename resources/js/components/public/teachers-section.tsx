import { SectionHeading } from '@/components/public/section-heading';
import { cn } from '@/lib/utils';
import { type TeacherProfile } from '@/types/admin';
import { GraduationCap, RotateCcw, Sparkles, UserRound } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { type KeyboardEvent, useState } from 'react';

/**
 * "Conoce a tu maestra": un perfil en grande si es una sola maestra,
 * o tarjetas que se voltean (con su formación atrás) si son varios.
 */
export function TeachersSection({ teachers }: { teachers: TeacherProfile[] }) {
    if (teachers.length === 0) {
        return null;
    }

    return (
        <section id="maestros" className="scroll-mt-24 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {teachers.length === 1 ? (
                    <FeaturedTeacher teacher={teachers[0]} />
                ) : (
                    <>
                        <SectionHeading
                            eyebrow="Nuestro equipo"
                            title="Conoce a quienes acompañan a tu peque"
                            description="Toca cada tarjeta para conocer su formación."
                        />
                        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {teachers.map((teacher, i) => (
                                <motion.li
                                    key={teacher.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-60px' }}
                                    transition={{ delay: (i % 3) * 0.08, duration: 0.45 }}
                                >
                                    <FlipCard teacher={teacher} />
                                </motion.li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </section>
    );
}

// --- Una sola maestra: perfil grande ---

function FeaturedTeacher({ teacher }: { teacher: TeacherProfile }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="grid items-center gap-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12"
        >
            <div className="relative mx-auto w-full max-w-xs md:max-w-none">
                {/* Manchita de color detrás de la foto */}
                <div aria-hidden="true" className="bg-brand-primary-soft absolute -inset-3 -z-0 rotate-3 rounded-[2.5rem]" />
                <div className="bg-brand-secondary-soft relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lg">
                    <TeacherPhoto teacher={teacher} />
                </div>
            </div>

            <div>
                <p className="bg-brand-accent-soft text-brand-accent-strong mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
                    Conoce a tu maestra
                </p>
                <h2 className="font-heading text-brand-primary-strong text-4xl font-bold tracking-tight sm:text-5xl">{teacher.name}</h2>
                {(teacher.full_name || teacher.title) && (
                    <p className="text-brand-text/70 mt-2 text-base font-semibold sm:text-lg">
                        {[teacher.full_name, teacher.title].filter(Boolean).join(' · ')}
                    </p>
                )}
                {teacher.bio && <p className="text-brand-text/80 mt-5 leading-relaxed whitespace-pre-line">{teacher.bio}</p>}

                {teacher.specialties.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-brand-text/60 mb-2 text-xs font-bold tracking-wider uppercase">Especialidades</h3>
                        <Specialties items={teacher.specialties} />
                    </div>
                )}

                {teacher.education_list.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-brand-text/60 mb-2 text-xs font-bold tracking-wider uppercase">Formación</h3>
                        <EducationList items={teacher.education_list} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// --- Varios maestros: tarjeta que se voltea ---

function FlipCard({ teacher }: { teacher: TeacherProfile }) {
    const [flipped, setFlipped] = useState(false);
    const reduceMotion = useReducedMotion();
    const toggle = () => setFlipped((v) => !v);
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
        }
    };

    const front = (
        <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-white shadow-md ring-1 ring-black/5">
            <TeacherPhoto teacher={teacher} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5 pt-20 text-white">
                <p className="font-heading text-3xl leading-tight font-bold drop-shadow">{teacher.name}</p>
                {teacher.title && <p className="mt-1 text-sm font-semibold text-white/90">{teacher.title}</p>}
                {teacher.specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {teacher.specialties.slice(0, 3).map((s) => (
                            <span key={s} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                                {s}
                            </span>
                        ))}
                        {teacher.specialties.length > 3 && (
                            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                                +{teacher.specialties.length - 3}
                            </span>
                        )}
                    </div>
                )}
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-white/80">
                    <Sparkles className="size-3.5" /> Toca para conocer su formación
                </p>
            </div>
        </div>
    );

    const back = (
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-md ring-1 ring-black/5">
            <div className="h-2 shrink-0" style={{ background: teacher.color }} />
            <div className="flex-1 overflow-y-auto p-6 text-left">
                <p className="font-heading text-brand-primary-strong text-2xl font-bold">{teacher.name}</p>
                {teacher.full_name && <p className="text-brand-text/80 font-semibold">{teacher.full_name}</p>}
                {teacher.title && <p className="text-brand-text/60 text-sm">{teacher.title}</p>}

                {teacher.education_list.length > 0 && (
                    <div className="mt-5">
                        <h3 className="text-brand-text/60 mb-2 text-xs font-bold tracking-wider uppercase">Formación</h3>
                        <EducationList items={teacher.education_list} />
                    </div>
                )}
                {teacher.specialties.length > 0 && (
                    <div className="mt-5">
                        <h3 className="text-brand-text/60 mb-2 text-xs font-bold tracking-wider uppercase">Especialidades</h3>
                        <Specialties items={teacher.specialties} small />
                    </div>
                )}
                {teacher.bio && <p className="text-brand-text/75 mt-5 text-sm leading-relaxed whitespace-pre-line">{teacher.bio}</p>}
            </div>
            <p className="text-brand-text/50 flex shrink-0 items-center justify-center gap-1.5 border-t py-3 text-xs font-bold">
                <RotateCcw className="size-3.5" /> Toca para regresar
            </p>
        </div>
    );

    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={flipped ? `Regresar a la foto de ${teacher.name}` : `Ver la formación de ${teacher.name}`}
            onClick={toggle}
            onKeyDown={onKeyDown}
            className="focus-visible:ring-brand-primary relative aspect-[3/4] cursor-pointer rounded-[1.75rem] focus-visible:ring-4 focus-visible:outline-none"
            style={{ perspective: 1200 }}
        >
            {reduceMotion ? (
                // Sin animaciones de giro (preferencia del sistema): cambia suave
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={flipped ? 'back' : 'front'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                    >
                        {flipped ? back : front}
                    </motion.div>
                </AnimatePresence>
            ) : (
                <motion.div
                    className="absolute inset-0"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                    whileHover={{ y: -4 }}
                >
                    <div
                        className="absolute inset-0"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        aria-hidden={flipped}
                    >
                        {front}
                    </div>
                    <div
                        className="absolute inset-0"
                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                        aria-hidden={!flipped}
                    >
                        {back}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// --- Piezas compartidas ---

function TeacherPhoto({ teacher }: { teacher: TeacherProfile }) {
    return teacher.photo_url ? (
        <img src={teacher.photo_url} alt={`Foto de ${teacher.name}`} loading="lazy" className="size-full object-cover" />
    ) : (
        <div className="bg-brand-secondary-soft text-brand-secondary-strong flex size-full items-center justify-center">
            <UserRound className="size-20 opacity-60" />
        </div>
    );
}

function Specialties({ items, small = false }: { items: string[]; small?: boolean }) {
    const tones = [
        'bg-brand-primary-soft text-brand-primary-strong',
        'bg-brand-secondary-soft text-brand-secondary-strong',
        'bg-brand-accent-soft text-brand-accent-strong',
    ];

    return (
        <ul className="flex flex-wrap gap-2">
            {items.map((s, i) => (
                <li
                    key={s}
                    className={cn('rounded-full font-bold', small ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1.5 text-sm', tones[i % tones.length])}
                >
                    {s}
                </li>
            ))}
        </ul>
    );
}

function EducationList({ items }: { items: string[] }) {
    return (
        <ul className="grid gap-2">
            {items.map((item) => (
                <li key={item} className="text-brand-text/85 flex items-start gap-2 text-sm">
                    <GraduationCap className="text-brand-secondary-strong mt-0.5 size-4 shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}
