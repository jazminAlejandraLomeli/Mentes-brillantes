import { WhatsAppIcon } from '@/components/brand/whatsapp-icon';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Botón flotante de WhatsApp (esquina inferior derecha).
 * Usa el verde de WhatsApp a propósito: los papás lo reconocen al instante.
 */
export function WhatsAppFab({ href }: { href: string }) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 18 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-xl shadow-black/15 focus-visible:ring-4 focus-visible:ring-[#25D366]/40 focus-visible:outline-none sm:right-6 sm:bottom-6"
        >
            {!reduceMotion && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.5s]" />}
            <WhatsAppIcon className="size-7" />
            <span className="hidden max-w-0 overflow-hidden font-bold whitespace-nowrap transition-all duration-300 group-hover:max-w-40 group-hover:pr-1 sm:inline">
                ¿Dudas? Escríbenos
            </span>
        </motion.a>
    );
}
