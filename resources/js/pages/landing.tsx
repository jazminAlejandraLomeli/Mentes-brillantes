import { BrandMark } from '@/components/brand/brand-logo';
import { EventsSection } from '@/components/public/events-section';
import { GallerySection } from '@/components/public/gallery-section';
import { HeroCarousel } from '@/components/public/hero-carousel';
import { HeroIntro } from '@/components/public/hero-intro';
import { HighlightsSection } from '@/components/public/highlights-section';
import { ServicesSection } from '@/components/public/services-section';
import { TeachersSection } from '@/components/public/teachers-section';
import { WhatsAppButton } from '@/components/public/whatsapp-button';
import PublicLayout from '@/layouts/public-layout';
import { type SharedData } from '@/types';
import { type TeacherProfile } from '@/types/admin';
import { type Banner, type GalleryItem, type Option, type Service, type SiteEvent } from '@/types/models';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'motion/react';

interface LandingProps {
    banners: Banner[];
    services: Service[];
    categories: Option[];
    events: SiteEvent[];
    gallery: GalleryItem[];
    teachers: TeacherProfile[];
    contactUrl: string;
    [key: string]: unknown;
}

export default function Landing() {
    const { banners, services, categories, events, gallery, teachers, contactUrl, site } = usePage<SharedData & LandingProps>().props;

    // El menú solo muestra las secciones que tienen contenido
    const links = [
        teachers.length > 0 && { href: '#maestros', label: 'Conócenos' },
        services.length > 0 && { href: '#servicios', label: 'Clases y cursos' },
        events.length > 0 && { href: '#eventos', label: 'Eventos' },
        gallery.length > 0 && { href: '#galeria', label: 'Galería' },
        { href: '#contacto', label: 'Contacto' },
    ].filter((link): link is { href: string; label: string } => Boolean(link));

    return (
        <PublicLayout links={links} contactUrl={contactUrl}>
            <Head title={site.business.tagline}>
                <meta name="description" content={`${site.business.name}: ${site.business.tagline}. ${site.business.teacher}.`} />
                <meta property="og:title" content={site.business.full_name || site.business.name} />
                <meta property="og:description" content={site.business.tagline} />
            </Head>

            <div id="inicio" className="scroll-mt-24">
                <HeroIntro
                    hero={site.hero ?? { title: site.business.full_name || site.business.name, subtitle: site.business.tagline }}
                    contactUrl={contactUrl}
                    hasServices={services.length > 0}
                />
                <HeroCarousel banners={banners} contactUrl={contactUrl} />
            </div>

            <HighlightsSection items={site.highlights ?? []} />
            <TeachersSection teachers={teachers} />
            <ServicesSection services={services} categories={categories} />
            <EventsSection events={events} />
            <GallerySection items={gallery} />

            {/* Llamado final antes del pie de página */}
            <section aria-label="Contacto" className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="from-brand-primary-soft via-brand-accent-soft to-brand-secondary-soft rounded-[2rem] bg-gradient-to-br px-6 py-12 text-center sm:py-16"
                >
                    <BrandMark className="mx-auto mb-5 h-12 w-auto" />
                    <h2 className="font-heading mx-auto max-w-xl text-3xl font-bold text-balance sm:text-4xl">¿Quieres que tu peque brille?</h2>
                    <p className="text-brand-text/70 mx-auto mt-3 max-w-lg">
                        Escríbenos y con gusto te contamos horarios, costos y cómo es una clase.
                    </p>
                    <WhatsAppButton href={contactUrl} size="lg" className="mt-7">
                        Escríbenos por WhatsApp
                    </WhatsAppButton>
                </motion.div>
            </section>
        </PublicLayout>
    );
}
