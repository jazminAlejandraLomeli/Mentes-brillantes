import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface WhatsAppButtonProps {
    href: string;
    children: ReactNode;
    variant?: 'primary' | 'soft' | 'white';
    size?: 'md' | 'lg';
    className?: string;
}

const variants = {
    primary: 'bg-brand-primary-strong text-white shadow-lg shadow-brand-primary/30 hover:brightness-110',
    soft: 'bg-brand-primary-soft text-brand-primary-strong hover:bg-brand-primary hover:text-white',
    white: 'bg-white text-brand-primary-strong shadow-lg hover:bg-brand-primary-soft',
};

const sizes = {
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
};

/** Botón que abre WhatsApp con el mensaje ya escrito. */
export function WhatsAppButton({ href, children, variant = 'primary', size = 'md', className }: WhatsAppButtonProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                'focus-visible:ring-brand-primary/30 inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:outline-none active:translate-y-0',
                variants[variant],
                sizes[size],
                className,
            )}
        >
            <WhatsAppIcon className={size === 'lg' ? 'size-5' : 'size-4'} />
            {children}
        </a>
    );
}
