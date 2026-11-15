import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';

/** Franja que avisa que es un sitio de demostración. */
export function DemoBanner() {
    const { demo } = usePage<SharedData>().props;

    if (!demo) {
        return null;
    }

    return (
        <div className="relative z-40 bg-neutral-900 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm">
            <Sparkles className="mr-1.5 inline size-4 text-amber-300" />
            Estás viendo una <strong>demo</strong>: puedes probar todo con confianza, los datos se reinician cada noche.
        </div>
    );
}
