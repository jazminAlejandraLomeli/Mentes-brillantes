import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';

interface TagsInputProps {
    id?: string;
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    max?: number;
    suggestions?: string[];
}

/**
 * Lista de etiquetas: escribe y presiona Enter (o coma) para agregar.
 * Ej. especialidades: "Lectura", "Matemáticas"…
 */
export function TagsInput({ id, value, onChange, placeholder, max = 12, suggestions = [] }: TagsInputProps) {
    const [text, setText] = useState('');
    const full = value.length >= max;

    const add = (raw: string) => {
        const tag = raw.trim().replace(/,$/, '').slice(0, 40);
        if (!tag || full || value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
        onChange([...value, tag]);
        setText('');
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(text);
        } else if (e.key === 'Backspace' && text === '' && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const available = suggestions.filter((s) => !value.some((t) => t.toLowerCase() === s.toLowerCase()));

    return (
        <div className="grid gap-2">
            <div className="border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 shadow-xs focus-within:ring-[3px]">
                {value.map((tag) => (
                    <span key={tag} className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full py-0.5 pr-1 pl-2.5 text-sm font-semibold">
                        {tag}
                        <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Quitar ${tag}`} className="hover:bg-primary/15 rounded-full p-0.5">
                            <X className="size-3" />
                        </button>
                    </span>
                ))}
                <input
                    id={id}
                    value={text}
                    onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setText(e.target.value))}
                    onKeyDown={onKeyDown}
                    onBlur={() => add(text)}
                    disabled={full}
                    placeholder={full ? `Máximo ${max}` : value.length === 0 ? placeholder : 'Agregar otra…'}
                    className="min-w-32 flex-1 bg-transparent px-1 text-base outline-none md:text-sm"
                />
            </div>
            {available.length > 0 && !full && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground text-xs">Ideas:</span>
                    {available.slice(0, 8).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => add(s)}
                            className={cn('hover:bg-accent rounded-full border px-2.5 py-0.5 text-xs font-medium transition')}
                        >
                            + {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
