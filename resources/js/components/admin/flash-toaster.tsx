import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle2, CircleAlert, TriangleAlert, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

type Flash = SharedData['flash'];

/**
 * Avisos después de guardar ("Banner creado 🎉") y, cuando aplica, el botón
 * sugerido para avisar por WhatsApp (ej. después de cancelar una clase).
 */
export function FlashToaster() {
    const { flash } = usePage<SharedData>().props;
    const [current, setCurrent] = useState<Flash | null>(null);

    useEffect(() => {
        if (flash.success || flash.error || flash.warning || flash.whatsapp) {
            setCurrent({ ...flash });
        }
    }, [flash]);

    // El aviso de éxito se va solo; el de WhatsApp se queda hasta que Liz decida
    useEffect(() => {
        if (!current || current.whatsapp || current.warning || current.error) return;
        const timer = window.setTimeout(() => setCurrent(null), 4000);

        return () => window.clearTimeout(timer);
    }, [current]);

    const sendWhatsApp = () => {
        if (!current?.whatsapp) return;
        window.open(current.whatsapp.url, '_blank', 'noopener');
        router.post(route('admin.appointments.reminder-sent', current.whatsapp.appointment_id), {}, { preserveScroll: true, preserveState: true });
        setCurrent(null);
    };

    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6"
        >
            <AnimatePresence>
                {current && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        className="bg-background pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border shadow-xl"
                    >
                        <div className="flex items-start gap-3 p-4">
                            <div className="flex-1 space-y-2 text-sm">
                                {current.success && <Line icon={CheckCircle2} tone="text-emerald-600" text={current.success} />}
                                {current.error && <Line icon={CircleAlert} tone="text-red-600" text={current.error} />}
                                {current.warning && <Line icon={TriangleAlert} tone="text-amber-600" text={current.warning} />}
                            </div>
                            <button
                                type="button"
                                onClick={() => setCurrent(null)}
                                aria-label="Cerrar aviso"
                                className="text-muted-foreground hover:text-foreground -m-1 rounded-full p-1"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        {current.whatsapp && (
                            <button
                                type="button"
                                onClick={sendWhatsApp}
                                className="flex w-full items-center justify-center gap-2 bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:brightness-105"
                            >
                                <WhatsAppIcon className="size-5" />
                                {current.whatsapp.label}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Line({ icon: Icon, tone, text }: { icon: typeof CheckCircle2; tone: string; text: string }) {
    return (
        <p className="flex items-start gap-2 font-medium">
            <Icon className={cn('mt-0.5 size-4 shrink-0', tone)} />
            <span>{text}</span>
        </p>
    );
}
