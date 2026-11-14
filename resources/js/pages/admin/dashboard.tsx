import { AppointmentList, AppointmentRow } from '@/components/admin/appointment-row';
import { EmptyState } from '@/components/admin/empty-state';
import { PageBody, PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { type Appointment } from '@/types/admin';
import { Head, Link, usePage } from '@inertiajs/react';
import { BellRing, CalendarCheck, CalendarPlus, Clock3, Image, Megaphone, Shapes, Users } from 'lucide-react';
import { type ComponentType, type ReactNode } from 'react';

interface DashboardProps {
    today: Appointment[];
    tomorrow: Appointment[];
    needReminder: Appointment[];
    stats: {
        active_students: number;
        classes_this_week: number;
        pending_confirmation: number;
        active_services: number;
        active_banners: number;
        upcoming_events: number;
    };
    [key: string]: unknown;
}

function greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';

    return 'Buenas noches';
}

export default function Dashboard() {
    const { today, tomorrow, needReminder, stats, auth } = usePage<SharedData & DashboardProps>().props;
    const firstName = auth.user.name.split(' ')[0];
    const todayLabel = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <AppLayout breadcrumbs={[{ title: 'Inicio', href: route('dashboard') }]}>
            <Head title="Inicio" />
            <PageBody>
                <PageHeader
                    title={`${greeting()}, ${firstName} ✨`}
                    description={<span className="first-letter:uppercase">{todayLabel}</span>}
                    actions={
                        <Button asChild className="rounded-full">
                            <Link href={route('admin.appointments.index', { new: 1 })}>
                                <CalendarPlus /> Agendar clase
                            </Link>
                        </Button>
                    }
                />

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Stat icon={CalendarCheck} label="Clases esta semana" value={stats.classes_this_week} href={route('admin.appointments.index')} />
                    <Stat
                        icon={Clock3}
                        label="Por confirmar"
                        value={stats.pending_confirmation}
                        href={route('admin.appointments.index', { view: 'list', status: 'pending' })}
                        tone="amber"
                    />
                    <Stat icon={Users} label="Alumnos activos" value={stats.active_students} href={route('admin.students.index')} tone="sky" />
                    <Stat icon={Megaphone} label="Eventos próximos" value={stats.upcoming_events} href={route('admin.events.index')} tone="violet" />
                </div>

                {needReminder.length > 0 && (
                    <section>
                        <SectionTitle icon={BellRing} title="Falta mandar recordatorio" hint="Clases de las próximas 48 horas" />
                        <AppointmentList className="border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/5">
                            {needReminder.map((a) => (
                                <AppointmentRow key={a.id} appointment={a} showDate />
                            ))}
                        </AppointmentList>
                    </section>
                )}

                <div className="grid gap-6 xl:grid-cols-2 [&>*]:min-w-0">
                    <DayColumn title="Hoy" appointments={today} empty="No tienes clases hoy. ¡A descansar! ☕" />
                    <DayColumn title="Mañana" appointments={tomorrow} empty="Mañana no hay clases agendadas." />
                </div>

                <section>
                    <SectionTitle icon={Image} title="Tu página web" />
                    <div className="grid gap-3 sm:grid-cols-3">
                        <QuickLink
                            href={route('admin.banners.index')}
                            icon={Image}
                            title="Banners"
                            text={`${stats.active_banners} visibles en el carrusel`}
                        />
                        <QuickLink
                            href={route('admin.services.index')}
                            icon={Shapes}
                            title="Servicios y cursos"
                            text={`${stats.active_services} publicados`}
                        />
                        <QuickLink
                            href={route('admin.events.index')}
                            icon={Megaphone}
                            title="Eventos y avisos"
                            text={`${stats.upcoming_events} próximos`}
                        />
                    </div>
                </section>
            </PageBody>
        </AppLayout>
    );
}

const tones = {
    pink: 'bg-primary/10 text-primary',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
};

function Stat({
    icon: Icon,
    label,
    value,
    href,
    tone = 'pink',
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number;
    href: string;
    tone?: keyof typeof tones;
}) {
    return (
        <Link href={href} className="bg-card rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className={`mb-3 inline-flex size-9 items-center justify-center rounded-xl ${tones[tone]}`}>
                <Icon className="size-5" />
            </span>
            <p className="font-heading text-3xl font-bold">{value}</p>
            <p className="text-muted-foreground text-sm">{label}</p>
        </Link>
    );
}

function SectionTitle({ icon: Icon, title, hint }: { icon: ComponentType<{ className?: string }>; title: string; hint?: string }) {
    return (
        <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h2 className="font-heading flex items-center gap-2 text-lg font-bold">
                <Icon className="text-primary size-5" /> {title}
            </h2>
            {hint && <span className="text-muted-foreground text-sm">· {hint}</span>}
        </div>
    );
}

function DayColumn({ title, appointments, empty }: { title: string; appointments: Appointment[]; empty: string }) {
    return (
        <section>
            <SectionTitle icon={CalendarCheck} title={title} hint={appointments.length === 1 ? '1 clase' : `${appointments.length} clases`} />
            {appointments.length === 0 ? (
                <EmptyState title={empty} />
            ) : (
                <AppointmentList>
                    {appointments.map((a) => (
                        <AppointmentRow key={a.id} appointment={a} />
                    ))}
                </AppointmentList>
            )}
        </section>
    );
}

function QuickLink({ href, icon: Icon, title, text }: { href: string; icon: ComponentType<{ className?: string }>; title: string; text: ReactNode }) {
    return (
        <Link href={href} className="bg-card hover:border-primary/40 flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition">
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                <Icon className="size-5" />
            </span>
            <span>
                <span className="block font-semibold">{title}</span>
                <span className="text-muted-foreground text-sm">{text}</span>
            </span>
        </Link>
    );
}
