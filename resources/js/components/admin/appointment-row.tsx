import { StatusBadge } from '@/components/admin/status-badge';
import { WhatsAppActions } from '@/components/admin/whatsapp-actions';
import { cn } from '@/lib/utils';
import { type Appointment } from '@/types/admin';
import { Link } from '@inertiajs/react';
import { Repeat } from 'lucide-react';
import { type ReactNode } from 'react';

interface AppointmentRowProps {
    appointment: Appointment;
    /** Muestra la fecha además de la hora (para listas de varios días) */
    showDate?: boolean;
    actions?: ReactNode;
    onClick?: () => void;
}

/** Una clase en una lista: hora, alumno, materia, estado y WhatsApp. */
export function AppointmentRow({ appointment, showDate = false, actions, onClick }: AppointmentRowProps) {
    const student = appointment.student;
    const cancelled = appointment.status === 'cancelled';

    return (
        <li className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center', cancelled && 'opacity-60')}>
            <button
                type="button"
                onClick={onClick}
                disabled={!onClick}
                className="flex min-w-0 flex-1 items-center gap-4 text-left disabled:cursor-default"
            >
                <div className="bg-primary/10 text-primary w-20 shrink-0 rounded-xl px-2 py-2 text-center">
                    <p className="text-sm leading-tight font-bold">{appointment.time_label.split(' – ')[0]}</p>
                    {showDate && (
                        <p className="mt-0.5 text-[0.65rem] leading-tight font-semibold first-letter:uppercase">
                            {appointment.date_label.split(' de ')[0]}
                        </p>
                    )}
                    {!showDate && <p className="text-[0.65rem] font-semibold opacity-70">{appointment.duration_minutes} min</p>}
                </div>
                <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate font-semibold">
                        {student ? student.name : 'Alumno'}
                        {appointment.appointment_series_id && (
                            <Repeat className="text-muted-foreground size-3.5 shrink-0" aria-label="Clase recurrente" />
                        )}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                        {appointment.topic}
                        {student?.guardian && <> · {student.guardian.name}</>}
                    </p>
                </div>
            </button>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <StatusBadge status={appointment.status} label={appointment.status_label} />
                {!cancelled && !appointment.is_past && <WhatsAppActions appointment={appointment} />}
                {actions}
            </div>
        </li>
    );
}

export function AppointmentList({ children, className }: { children: ReactNode; className?: string }) {
    return <ul className={cn('bg-card divide-y rounded-2xl border shadow-sm', className)}>{children}</ul>;
}

export function StudentLink({ id, children }: { id: number; children: ReactNode }) {
    return (
        <Link href={route('admin.students.show', id)} className="hover:underline">
            {children}
        </Link>
    );
}
