/**
 * Datos que llegan de Laravel (App\Http\Resources\*).
 */

export interface Option {
    value: string;
    label: string;
    color?: BrandColor;
}

export interface Banner {
    id: number;
    title: string;
    subtitle: string | null;
    image_url: string | null;
    cta_label: string | null;
    cta_url: string | null;
    sort_order: number;
    is_active: boolean;
}

/** key de config/site.json → categories */
export type ServiceCategory = string;
export type BrandColor = 'primary' | 'secondary' | 'accent';

export interface Service {
    id: number;
    title: string;
    slug: string;
    category: ServiceCategory;
    category_label: string;
    category_color: BrandColor;
    short_description: string;
    description: string | null;
    age_min: number | null;
    age_max: number | null;
    age_range: string | null;
    modality: string;
    modality_label: string;
    price: string | null;
    price_note: string | null;
    show_price: boolean;
    image_url: string | null;
    is_featured: boolean;
    is_active?: boolean;
    sort_order?: number;
    whatsapp_url?: string;
}

export interface SiteEvent {
    id: number;
    title: string;
    slug: string;
    body: string;
    event_date: string | null;
    event_time: string | null;
    date_label: string | null;
    time_label: string | null;
    is_past: boolean;
    location: string | null;
    image_url: string | null;
    is_published: boolean;
}

export interface GalleryItem {
    id: number;
    image_url: string;
    caption: string | null;
    sort_order: number;
    is_active: boolean;
}
