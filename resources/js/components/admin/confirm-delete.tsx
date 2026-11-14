import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';

interface ConfirmDeleteProps {
    /** URL de la ruta DELETE */
    url: string;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    /** Botón que abre la confirmación (por defecto, un botón "Eliminar") */
    trigger?: ReactNode;
    method?: 'delete' | 'patch';
}

/** Pide confirmación antes de borrar algo. */
export function ConfirmDelete({ url, title, description, confirmLabel = 'Sí, eliminar', trigger, method = 'delete' }: ConfirmDeleteProps) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const confirm = () => {
        setProcessing(true);
        router.visit(url, {
            method,
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Trash2 /> Eliminar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={confirm} disabled={processing}>
                        {processing && <LoaderCircle className="animate-spin" />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
