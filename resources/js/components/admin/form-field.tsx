import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    htmlFor?: string;
    error?: string;
    hint?: ReactNode;
    optional?: boolean;
    className?: string;
    children: ReactNode;
}

export function FormField({ label, htmlFor, error, hint, optional, className, children }: FormFieldProps) {
    return (
        <div className={cn('grid gap-1.5', className)}>
            <Label htmlFor={htmlFor} className="font-semibold">
                {label} {optional && <span className="text-muted-foreground font-normal">(opcional)</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-muted-foreground text-xs">{hint}</p>}
            <InputError message={error} />
        </div>
    );
}

/** Tarjeta blanca para agrupar campos de un formulario. */
export function FormCard({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
    return (
        <section className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
            {title && (
                <header className="mb-5">
                    <h2 className="font-heading text-lg font-bold">{title}</h2>
                    {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
                </header>
            )}
            <div className="grid gap-5">{children}</div>
        </section>
    );
}
