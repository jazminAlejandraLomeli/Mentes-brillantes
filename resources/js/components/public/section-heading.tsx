import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface SectionHeadingProps {
    eyebrow?: string;
    title: string;
    description?: string;
    className?: string;
}

export function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn('mx-auto mb-10 max-w-2xl text-center sm:mb-12', className)}
        >
            {eyebrow && (
                <p className="bg-brand-accent-soft text-brand-accent-strong mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
                    {eyebrow}
                </p>
            )}
            <h2 className="font-heading text-brand-text text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
            {description && <p className="text-brand-text/70 mt-3 text-base text-pretty sm:text-lg">{description}</p>}
        </motion.div>
    );
}
