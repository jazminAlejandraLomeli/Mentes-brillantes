import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { LoaderCircle, Save } from 'lucide-react';

/** Barra inferior de los formularios: Cancelar + Guardar. */
export function FormActions({ cancelHref, processing, label = 'Guardar' }: { cancelHref: string; processing: boolean; label?: string }) {
    return (
        <div className="bg-background/90 sticky bottom-0 -mx-4 flex justify-end gap-2 border-t px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <Button variant="outline" asChild className="rounded-full">
                <Link href={cancelHref}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={processing} className="rounded-full px-6">
                {processing ? <LoaderCircle className="animate-spin" /> : <Save />}
                {label}
            </Button>
        </div>
    );
}
