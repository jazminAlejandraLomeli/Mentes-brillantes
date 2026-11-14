import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type Appointment } from '@/types/admin';
import { router } from '@inertiajs/react';
import { CalendarClock, Check, ChevronDown, CircleX } from 'lucide-react';

/** Abre WhatsApp con el mensaje y marca la cita como "recordatorio enviado". */
export function openWhatsApp(appointment: Appointment, url: string) {
    // Se abre primero para que el navegador no lo bloquee
    window.open(url, '_blank', 'noopener');
    router.post(route('admin.appointments.reminder-sent', appointment.id), {}, { preserveScroll: true, preserveState: true });
}

/**
 * Botón verde "Recordatorio" + menú con "Avisar cancelación" y "Avisar cambio de horario".
 */
export function WhatsAppActions({ appointment, compact = false }: { appointment: Appointment; compact?: boolean }) {
    if (!appointment.whatsapp) return null;
    const links = appointment.whatsapp;
    const sent = Boolean(appointment.reminder_sent_at);

    return (
        <div className="inline-flex">
            <Button
                type="button"
                size="sm"
                onClick={() => openWhatsApp(appointment, links.reminder)}
                className={cn('rounded-r-none bg-[#25D366] text-white hover:bg-[#1fb857]', sent && 'bg-[#25D366]/80')}
                title={sent ? 'Ya se envió un mensaje. Puedes mandar otro.' : 'Enviar recordatorio por WhatsApp'}
            >
                {sent ? <Check /> : <WhatsAppIcon className="size-4" />}
                {!compact && (sent ? 'Enviado' : 'Recordatorio')}
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        size="sm"
                        aria-label="Más mensajes de WhatsApp"
                        className="rounded-l-none border-l border-white/30 bg-[#25D366] px-2 text-white hover:bg-[#1fb857]"
                    >
                        <ChevronDown />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel>Avisar por WhatsApp</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => openWhatsApp(appointment, links.reminder)}>
                        <WhatsAppIcon className="size-4" /> Recordatorio / confirmación
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => openWhatsApp(appointment, links.reschedule)}>
                        <CalendarClock /> Cambio de horario
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => openWhatsApp(appointment, links.cancellation)}>
                        <CircleX /> Cancelación
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
