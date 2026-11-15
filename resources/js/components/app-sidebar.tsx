import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Calendar, CalendarDays, ExternalLink, GraduationCap, House, Image, Images, MessageSquareText, Palette, Shapes, Users } from 'lucide-react';
import AppLogo from './app-logo';

const agendaItems: NavItem[] = [
    { title: 'Inicio', url: route('dashboard'), icon: House },
    { title: 'Agenda', url: route('admin.appointments.index'), icon: CalendarDays },
    { title: 'Alumnos', url: route('admin.students.index'), icon: Users },
];

// En salones con varios maestros va junto a la agenda; si no, junto a la página web
const teachersItem: NavItem = { title: 'Maestros', url: route('admin.teachers.index'), icon: GraduationCap };

const contentItems: NavItem[] = [
    { title: 'Banners', url: route('admin.banners.index'), icon: Image },
    { title: 'Servicios y cursos', url: route('admin.services.index'), icon: Shapes },
    { title: 'Eventos y avisos', url: route('admin.events.index'), icon: Calendar },
    { title: 'Galería', url: route('admin.gallery.index'), icon: Images },
];

const settingsItems: NavItem[] = [
    { title: 'Colores, letras y logo', url: route('admin.settings.appearance'), icon: Palette },
    { title: 'Mensajes de WhatsApp', url: route('admin.settings.messages'), icon: MessageSquareText },
];

const footerNavItems: NavItem[] = [{ title: 'Ver mi página', url: route('home'), icon: ExternalLink }];

export function AppSidebar() {
    const { site } = usePage<SharedData>().props;
    const multiTeacher = Boolean(site.features?.multi_teacher);
    const classItems = multiTeacher ? [...agendaItems, teachersItem] : agendaItems;
    const pageItems = multiTeacher ? contentItems : [teachersItem, ...contentItems];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={classItems} label="Clases" />
                <NavMain items={pageItems} label="Mi página web" />
                <NavMain items={settingsItems} label="Personalizar" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
