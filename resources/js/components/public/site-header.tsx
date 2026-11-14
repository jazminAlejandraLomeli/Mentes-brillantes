import { BrandLogo } from '@/components/brand/brand-logo';
import { WhatsAppButton } from '@/components/public/whatsapp-button';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export interface NavLink {
    href: string;
    label: string;
}

interface SiteHeaderProps {
    links: NavLink[];
    contactUrl: string;
}

export function SiteHeader({ links, contactUrl }: SiteHeaderProps) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={cn(
                'sticky top-0 z-30 transition-all duration-300',
                scrolled || open ? 'bg-brand-background/90 shadow-sm backdrop-blur-md' : 'bg-transparent',
            )}
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
                <a href="#inicio" aria-label="Ir al inicio" onClick={() => setOpen(false)}>
                    <BrandLogo />
                </a>

                <nav aria-label="Secciones" className="hidden items-center gap-1 md:flex">
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-brand-text/80 hover:bg-brand-primary-soft hover:text-brand-primary-strong rounded-full px-3.5 py-2 text-sm font-semibold transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <WhatsAppButton href={contactUrl} className="hidden sm:inline-flex">
                        Agenda una clase
                    </WhatsAppButton>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="menu-movil"
                        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                        className="text-brand-text hover:bg-brand-primary-soft rounded-full p-2.5 transition-colors md:hidden"
                    >
                        {open ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.nav
                        id="menu-movil"
                        aria-label="Secciones"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden md:hidden"
                    >
                        <div className="flex flex-col gap-1 px-4 pt-1 pb-5">
                            {links.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="text-brand-text hover:bg-brand-primary-soft rounded-2xl px-4 py-3 text-base font-semibold"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <WhatsAppButton href={contactUrl} size="lg" className="mt-2">
                                Agenda una clase
                            </WhatsAppButton>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
