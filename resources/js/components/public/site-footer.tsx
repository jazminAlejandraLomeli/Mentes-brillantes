import { BrandLogo } from '@/components/brand/brand-logo';
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type Location } from '@/types/admin';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, Instagram, MapPin, Music2 } from 'lucide-react';
import { type ComponentType } from 'react';

interface SocialLink {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
}

export function SiteFooter({ contactUrl }: { contactUrl: string }) {
    const { site, locations = [] } = usePage<SharedData & { locations?: Location[] }>().props;

    const social: SocialLink[] = [
        { label: 'Instagram', href: site.social.instagram, icon: Instagram },
        { label: 'Facebook', href: site.social.facebook, icon: Facebook },
        { label: 'TikTok', href: site.social.tiktok, icon: Music2 },
        { label: 'WhatsApp', href: contactUrl, icon: WhatsAppIcon },
    ].filter((s) => Boolean(s.href));

    return (
        <footer id="contacto" className="border-brand-primary-soft relative mt-8 border-t-4 bg-white/70">
            <div
                className={cn(
                    'mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6',
                    locations.length > 0 ? 'md:grid-cols-[1.2fr_1.2fr_1fr]' : 'md:grid-cols-[1.4fr_1fr]',
                )}
            >
                <div>
                    <BrandLogo withTeacher />
                    <p className="text-brand-text/70 mt-4 max-w-sm text-sm leading-relaxed">{site.business.tagline}.</p>
                </div>

                {locations.length > 0 && (
                    <div className="min-w-0">
                        <h2 className="font-heading text-brand-text text-base font-bold">{locations.length > 1 ? 'Sucursales' : 'Visítanos'}</h2>
                        <ul className="mt-4 grid gap-3">
                            {locations.map((location) => (
                                <li key={location.id}>
                                    <a
                                        href={location.directions_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-text/75 hover:text-brand-text group flex items-start gap-2 text-sm leading-relaxed"
                                    >
                                        <MapPin className="text-brand-primary-strong mt-0.5 size-4 shrink-0" />
                                        <span>
                                            {location.name && <span className="text-brand-text block font-semibold">{location.name}</span>}
                                            <span className="underline-offset-4 group-hover:underline">{location.address}</span>
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div>
                    <h2 className="font-heading text-brand-text text-base font-bold">Síguenos y escríbenos</h2>
                    <ul className="mt-4 flex flex-wrap gap-3">
                        {social.map(({ label, href, icon: Icon }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="bg-brand-primary-soft text-brand-primary-strong hover:bg-brand-primary-strong flex size-11 items-center justify-center rounded-2xl transition-all hover:-translate-y-0.5 hover:text-white"
                                >
                                    <Icon className="size-5" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="text-brand-text/50 mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-black/5 px-4 py-5 text-xs sm:flex-row sm:px-6">
                <p>
                    © {new Date().getFullYear()} {site.business.name} · Hecho con 💖
                </p>
                <Link href={route('login')} className="hover:text-brand-text underline-offset-4 hover:underline">
                    Acceso
                </Link>
            </div>
        </footer>
    );
}
