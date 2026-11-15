import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { StatusBadge } from '@/components/admin/status-badge';
import { openWhatsApp } from '@/components/admin/whatsapp-actions';
import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Appointment, type AppointmentStatus } from '@/types/admin';
import { Link, router } from '@inertiajs/react';
import { CalendarClock, Check, CheckCheck, CircleX, Clock, GraduationCap, Pencil, Repeat, StickyNote, UserRound } from 'lucide-react';

interface Props {
    appointment: Appointment | null;
    onClose: () => void;
    onEdit: (appointment: Appointment) => void;
}

/**
 * Detalle de una clase: cambiar estado con un clic y mandar WhatsApp.
 */
export function AppointmentDetail({ appointment, onClose, onEdit }: Props) {
    const setStatus = (status: AppointmentStatus) => {
        if (!appointment) return;
        router.patch(route('admin.appointments.status', appointment.id), { status }, { preserveScroll: true, onSuccess: onClose });
    };

    return (
        <Dialog open={appointment !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                {appointment && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="font-heading text-xl">{appointment.student?.name}</DialogTitle>
                            <DialogDescription className="flex items-center gap-2">
                                <StatusBadge status={appointment.status} label={appointment.status_label} />
                                {appointment.appointment_series_id && (
                                    <span className="inline-flex items-center gap-1 text-xs">
                                        <Repeat className="size-3.5" /> Clase recurrente
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <dl className="grid gap-2.5 text-sm">
                            <Row icon={CalendarClock}>
                                <span className="first-letter:uppercase">{appointment.date_label}</span>
                            </Row>
                            <Row icon={Clock}>
                                {appointment.time_label} · {appointment.topic}
                            </Row>
                            {appointment.teacher && (
                                <Row icon={GraduationCap}>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="size-2.5 rounded-full" style={{ background: appointment.teacher.color }} />
                                        Con {appointment.teacher.name}
                                    </span>
                                </Row>
                            )}
                            {appointment.student?.guardian && (
                                <Row icon={UserRound}>
                                    {appointment.student.guardian.name} · {appointment.student.guardian.whatsapp_phone_formatted}
                                </Row>
                            )}
                            {appointment.notes && <Row icon={StickyNote}>{appointment.notes}</Row>}
                            {appointment.reminder_sent_at && (
                                <Row icon={Check}>
                                    Último WhatsApp:{' '}
                                    {new Date(appointment.reminder_sent_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                                </Row>
                            )}
                        </dl>

                        {/* WhatsApp */}
                        {appointment.whatsapp && appointment.status !== 'completed' && (
                            <div className="grid gap-2 rounded-2xl bg-[#25D366]/8 p-3">
                                <p className="flex items-center gap-1.5 text-xs font-bold text-[#128C4B] uppercase">
                                    <WhatsAppIcon className="size-4" /> Avisar a la familia
                                </p>
                                <Button
                                    onClick={() => openWhatsApp(appointment, appointment.whatsapp!.reminder)}
                                    className="bg-[#25D366] text-white hover:bg-[#1fb857]"
                                >
                                    <WhatsAppIcon className="size-4" /> Recordatorio / confirmación
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" onClick={() => openWhatsApp(appointment, appointment.whatsapp!.reschedule)}>
                                        Cambio de horario
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => openWhatsApp(appointment, appointment.whatsapp!.cancellation)}>
                                        Cancelación
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Estado */}
                        <div className="grid gap-2">
                            <p className="text-muted-foreground text-xs font-bold uppercase">Marcar como</p>
                            <div className="grid grid-cols-3 gap-2">
                                <StatusButton
                                    active={appointment.status === 'confirmed'}
                                    onClick={() => setStatus('confirmed')}
                                    icon={Check}
                                    label="Confirmada"
                                />
                                <StatusButton
                                    active={appointment.status === 'completed'}
                                    onClick={() => setStatus('completed')}
                                    icon={CheckCheck}
                                    label="Completada"
                                />
                                <StatusButton
                                    active={appointment.status === 'cancelled'}
                                    onClick={() => setStatus('cancelled')}
                                    icon={CircleX}
                                    label="Cancelada"
                                />
                            </div>
                            {appointment.status !== 'pending' && (
                                <button
                                    type="button"
                                    onClick={() => setStatus('pending')}
                                    className="text-muted-foreground text-xs underline-offset-4 hover:underline"
                                >
                                    Regresar a «Pendiente»
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                            <ConfirmDelete
                                url={route('admin.appointments.destroy', appointment.id)}
                                title="¿Eliminar esta clase?"
                                description="Desaparece de la agenda. Si solo no se dio, mejor márcala como «Cancelada» para conservar el historial."
                            />
                            <div className="flex gap-2">
                                {appointment.student && (
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={route('admin.students.show', appointment.student_id)}>Ver alumno</Link>
                                    </Button>
                                )}
                                <Button size="sm" onClick={() => onEdit(appointment)}>
                                    <Pencil /> Editar / mover
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function Row({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
    return (
        <div className="flex gap-2.5">
            <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <dd>{children}</dd>
        </div>
    );
}

function StatusButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Check; label: string }) {
    return (
        <Button
            type="button"
            variant={active ? 'default' : 'outline'}
            size="sm"
            onClick={onClick}
            disabled={active}
            className="flex-col gap-0.5 py-6 text-xs"
        >
            <Icon />
            {label}
        </Button>
    );
}
