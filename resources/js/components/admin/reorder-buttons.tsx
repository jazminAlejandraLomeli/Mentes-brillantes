import { router } from '@inertiajs/react';
import { ArrowDown, ArrowUp } from 'lucide-react';

/**
 * Flechas para subir o bajar un elemento en la lista (orden en la página).
 */
export function ReorderButtons({ ids, index, url }: { ids: number[]; index: number; url: string }) {
    const move = (delta: number) => {
        const next = [...ids];
        const [item] = next.splice(index, 1);
        next.splice(index + delta, 0, item);
        router.post(url, { ids: next }, { preserveScroll: true });
    };

    return (
        <div className="flex flex-col">
            <button
                type="button"
                onClick={() => move(-1)}
                disabled={index === 0}
                aria-label="Subir"
                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-1 disabled:opacity-25"
            >
                <ArrowUp className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => move(1)}
                disabled={index === ids.length - 1}
                aria-label="Bajar"
                className="text-muted-foreground hover:bg-accent hover:text-foreground rounded-md p-1 disabled:opacity-25"
            >
                <ArrowDown className="size-4" />
            </button>
        </div>
    );
}
