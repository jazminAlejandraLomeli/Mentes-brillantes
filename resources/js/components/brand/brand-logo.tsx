import { RainbowMark } from '@/components/brand/rainbow-mark';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface BrandLogoProps {
    className?: string;
    /** Muestra el nombre de la maestra debajo (solo si no hay logo subido) */
    withTeacher?: boolean;
}

/**
 * Logo del negocio: la imagen subida en el panel o, si no hay, el arcoíris + el nombre.
 * Así sirve igual para Mentes Brillantes que para cualquier otro cliente.
 */
export function BrandLogo({ className, withTeacher = false }: BrandLogoProps) {
    const { site, brand } = usePage<SharedData>().props;

    if (brand.logo_url) {
        return (
            <span className={cn('inline-flex items-center', className)}>
                <img src={brand.logo_url} alt={site.business.name} className="h-10 w-auto max-w-44 object-contain sm:h-12 sm:max-w-56" />
            </span>
        );
    }

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

/**
 * Solo el logo, sin el nombre al lado (o el arcoíris si no hay logo).
 * `square` usa el icono cuadrado: para espacios chicos como el menú del panel.
 */
export function BrandMark({ className, square = false }: { className?: string; square?: boolean }) {
    const { site, brand } = usePage<SharedData>().props;

    if (!brand.logo_url) {
        return <RainbowMark className={className} />;
    }

    return square ? (
        <img src={brand.apple_icon_url ?? brand.logo_url} alt={site.business.name} className={cn('aspect-square object-contain', className)} />
    ) : (
        <img src={brand.logo_url} alt={site.business.name} className={cn('max-w-64 object-contain', className)} />
    );
}
