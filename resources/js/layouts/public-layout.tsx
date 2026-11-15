import { DemoBanner } from '@/components/demo-banner';
import { SiteFooter } from '@/components/public/site-footer';
import { type NavLink, SiteHeader } from '@/components/public/site-header';
import { WhatsAppFab } from '@/components/public/whatsapp-fab';
import { useForceLightMode } from '@/hooks/use-force-light-mode';
import { type ReactNode, useEffect } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
    links: NavLink[];
    contactUrl: string;
}

/**
 * Layout de la página pública. Siempre en modo claro: la marca es pastel
 * y así se ve igual en todos los celulares.
 */
export default function PublicLayout({ children, links, contactUrl }: PublicLayoutProps) {
    useForceLightMode();

    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';

        return () => {
            document.documentElement.style.scrollBehavior = '';
        };
    }, []);

    return (
        <div className="bg-brand-background text-brand-text font-body min-h-screen">
            <a
                href="#contenido"
                className="bg-brand-primary-strong sr-only z-50 rounded-full px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
                Saltar al contenido
            </a>
            <DemoBanner />
            <SiteHeader links={links} contactUrl={contactUrl} />
            <main id="contenido">{children}</main>
            <SiteFooter contactUrl={contactUrl} />
            <WhatsAppFab href={contactUrl} />
        </div>
    );
}
