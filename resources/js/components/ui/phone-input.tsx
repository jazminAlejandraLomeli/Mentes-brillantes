import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

/** Deja solo los 10 dígitos (quita +52, espacios, guiones, paréntesis). */
export function phoneDigits(value: string): string {
    let digits = value.replace(/\D+/g, '');
    if (digits.length === 13 && digits.startsWith('521')) digits = digits.slice(3);
    else if (digits.length === 12 && digits.startsWith('52')) digits = digits.slice(2);
    return digits.slice(0, 10);
}

/** "3781220818" → "378 122 0818" (también a medias mientras se escribe). */
export function formatPhone(value: string): string {
    const d = phoneDigits(value);
    return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(' ');
}

interface PhoneInputProps {
    id?: string;
    /** Siempre se guardan solo los dígitos */
    value: string;
    onChange: (digits: string) => void;
    invalid?: boolean;
    autoFocus?: boolean;
}

/**
 * Campo de celular de México: solo deja escribir números, máximo 10,
 * y los acomoda como "378 122 0818" mientras escribes.
 * Si pegan "+52 1 378 122 0818", lo limpia solo.
 */
export function PhoneInput({ id, value, onChange, invalid, autoFocus }: PhoneInputProps) {
    const digits = phoneDigits(value);
    const complete = digits.length === 10;

    return (
        <div className="grid gap-1">
            <div
                className={cn(
                    'border-input focus-within:border-ring focus-within:ring-ring/50 flex h-9 items-center overflow-hidden rounded-md border shadow-xs focus-within:ring-[3px]',
                    invalid && 'border-destructive',
                )}
            >
                <span className="bg-muted text-muted-foreground flex h-full items-center border-r px-3 text-sm font-medium select-none">🇲🇽 +52</span>
                <input
                    id={id}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    autoFocus={autoFocus}
                    aria-invalid={invalid || undefined}
                    placeholder="378 122 0818"
                    value={formatPhone(value)}
                    onChange={(e) => onChange(phoneDigits(e.target.value))}
                    onKeyDown={(e) => {
                        // Bloquea letras y símbolos (deja borrar, moverse y atajos)
                        if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
                    }}
                    className="h-full flex-1 bg-transparent px-3 text-base tracking-wide outline-none md:text-sm"
                />
                {complete && <Check className="mr-3 size-4 text-emerald-600" aria-label="Número completo" />}
            </div>
            <p className={cn('text-xs', complete ? 'text-emerald-600' : 'text-muted-foreground')}>
                {complete ? 'Número completo' : `${digits.length}/10 dígitos`}
            </p>
        </div>
    );
}
