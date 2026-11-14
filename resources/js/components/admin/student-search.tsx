import { cn } from '@/lib/utils';
import { type StudentOption } from '@/types/admin';
import { Search, X } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';

/** "Sofía" y "sofia" cuentan igual al buscar. */
const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

interface StudentSearchProps {
    students: StudentOption[];
    selectedId: number | null;
    onSelect: (id: number | null) => void;
    className?: string;
}

/**
 * Buscador de alumnos con sugerencias: escribe parte del nombre del niño
 * o de su mamá/papá y elige de la lista (con el mouse o con las flechas + Enter).
 */
export function StudentSearch({ students, selectedId, onSelect, className }: StudentSearchProps) {
    const listId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);

    const selected = students.find((s) => s.id === selectedId) ?? null;

    const results = useMemo(() => {
        const q = normalize(query.trim());
        const list = q ? students.filter((s) => normalize(`${s.name} ${s.guardian ?? ''}`).includes(q)) : students;
        return list.slice(0, 8);
    }, [query, students]);

    const choose = (student: StudentOption) => {
        onSelect(student.id);
        setQuery('');
        setOpen(false);
    };

    // Ya hay un niño elegido: se muestra como etiqueta con su ✕ para quitarlo
    if (selected) {
        return (
            <div className={cn('bg-primary/10 text-primary flex h-9 items-center gap-2 rounded-full pr-1 pl-3 text-sm font-semibold', className)}>
                <Search className="size-4 shrink-0" />
                <span className="max-w-48 truncate">{selected.name}</span>
                <button
                    type="button"
                    onClick={() => {
                        onSelect(null);
                        requestAnimationFrame(() => inputRef.current?.focus());
                    }}
                    aria-label={`Quitar filtro de ${selected.name}`}
                    className="hover:bg-primary/15 rounded-full p-1"
                >
                    <X className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <div className={cn('relative', className)}>
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded={open && results.length > 0}
                aria-controls={listId}
                aria-activedescendant={open && results[active] ? `${listId}-${results[active].id}` : undefined}
                aria-autocomplete="list"
                aria-label="Buscar alumno en la agenda"
                placeholder="Buscar niño o tutor…"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => window.setTimeout(() => setOpen(false), 150)}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setOpen(true);
                        setActive((i) => Math.min(i + 1, results.length - 1));
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setActive((i) => Math.max(i - 1, 0));
                    } else if (e.key === 'Enter' && open && results[active]) {
                        e.preventDefault();
                        choose(results[active]);
                    } else if (e.key === 'Escape') {
                        setOpen(false);
                    }
                }}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-full border bg-transparent pr-3 pl-9 text-sm shadow-xs outline-none focus-visible:ring-[3px] sm:w-56"
            />

            {open && (
                <ul
                    id={listId}
                    role="listbox"
                    className="bg-popover absolute top-full left-0 z-30 mt-1 max-h-72 w-full min-w-64 overflow-y-auto rounded-xl border p-1 shadow-lg"
                >
                    {results.length === 0 ? (
                        <li className="text-muted-foreground px-3 py-2 text-sm">No encontramos a nadie con «{query}»</li>
                    ) : (
                        results.map((student, i) => (
                            <li
                                key={student.id}
                                id={`${listId}-${student.id}`}
                                role="option"
                                aria-selected={i === active}
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => choose(student)}
                                className={cn('cursor-pointer rounded-lg px-3 py-2', i === active && 'bg-accent')}
                            >
                                <span className="block text-sm font-semibold">{student.name}</span>
                                {student.guardian && <span className="text-muted-foreground block text-xs">{student.guardian}</span>}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}
