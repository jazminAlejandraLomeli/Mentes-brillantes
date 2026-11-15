import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SiteConfig {
    business: { name: string; full_name: string; owner: string; tagline: string; teacher: string; signature: string };
    whatsapp: { phone: string; default_message: string };
    social: { instagram: string; facebook: string; tiktok: string };
    features?: { multi_teacher?: boolean };
    categories?: { key: string; label: string; color: 'primary' | 'secondary' | 'accent' }[];
    /** Frase de bienvenida arriba del carrusel. Las palabras entre *asteriscos* se resaltan. */
    hero?: { eyebrow?: string; title: string; subtitle?: string };
    highlights?: { icon: 'heart' | 'sparkles' | 'message' | 'book' | 'star' | 'users'; title: string; text: string }[];
}

export type ThemeSettings = {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    heading_font: string;
    body_font: string;
};

export interface SharedData {
    name: string;
    auth: Auth;
    site: SiteConfig;
    theme: ThemeSettings;
    /** Logo e icono subidos en el panel (null = se usa el arcoíris) */
    brand: { logo_url: string | null; icon_url: string; apple_icon_url: string | null };
    flash: {
        success: string | null;
        error: string | null;
        warning: string | null;
        whatsapp: { label: string; url: string; appointment_id: number } | null;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
