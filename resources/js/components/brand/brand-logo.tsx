import { RainbowMark } from '@/components/brand/rainbow-mark';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface BrandLogoProps {
    className?: string;
    /** Muestra "Lic. Lizbeth…" debajo del nombre */
    withTeacher?: boolean;
}

export function BrandLogo({ className, withTeacher = false }: BrandLogoProps) {
    const { site } = usePage<SharedData>().props;

    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <RainbowMark className="h-7 shrink-0 sm:h-8" />
            <span className="flex flex-col leading-none">
                <span className="font-heading text-brand-primary-strong text-lg font-bold tracking-tight sm:text-xl">{site.business.name}</span>
                {withTeacher && site.business.teacher && (
                    <span className="text-brand-text/60 mt-1 text-[0.65rem] font-semibold tracking-[0.18em] uppercase">{site.business.teacher}</span>
                )}
            </span>
        </span>
    );
}
