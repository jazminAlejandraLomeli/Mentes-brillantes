import { cn } from '@/lib/utils';

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    id?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
}

/** Interruptor encendido/apagado (ej. "Mostrar en la página"). */
export function Switch({ checked, onCheckedChange, id, label, disabled, className }: SwitchProps) {
    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                'focus-visible:ring-ring/50 relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'bg-primary' : 'bg-input',
                className,
            )}
        >
            <span className={cn('size-5 rounded-full shadow transition-transform', checked ? 'bg-primary-foreground translate-x-5.5' : 'translate-x-0.5 bg-white')} />
        </button>
    );
}

/** Switch con su texto al lado, para formularios. */
export function SwitchField({
    checked,
    onCheckedChange,
    label,
    description,
    id,
}: {
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
    label: string;
    description?: string;
    id: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <label htmlFor={id} className="cursor-pointer">
                <span className="text-sm font-semibold">{label}</span>
                {description && <span className="text-muted-foreground block text-xs">{description}</span>}
            </label>
            <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}
