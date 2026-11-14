import { cn } from '@/lib/utils';

/**
 * Arcoíris del logo de Mentes Brillantes, dibujado con los colores del tema
 * (cambia solo si Liz cambia la paleta en el panel).
 */
export function RainbowMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 64 40" fill="none" aria-hidden="true" className={cn('h-8 w-auto', className)}>
            <path d="M6 36a26 26 0 0 1 52 0" className="stroke-brand-primary" strokeWidth="7" strokeLinecap="round" />
            <path d="M14 36a18 18 0 0 1 36 0" className="stroke-brand-accent" strokeWidth="6" strokeLinecap="round" />
            <path d="M21 36a11 11 0 0 1 22 0" className="stroke-brand-secondary" strokeWidth="5" strokeLinecap="round" />
            <path d="M27 36a5 5 0 0 1 10 0" stroke="#87D068" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}
