import { cn } from '@/lib/utils';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

interface ImageInputProps {
    /** Imagen que ya está guardada */
    currentUrl?: string | null;
    file: File | null;
    onChange: (file: File | null) => void;
    /** Para quitar la imagen guardada (si se permite) */
    onRemove?: () => void;
    removed?: boolean;
    aspect?: string;
    hint?: string;
}

/**
 * Elegir una foto con vista previa. Se puede arrastrar y soltar.
 */
export function ImageInput({ currentUrl, file, onChange, onRemove, removed, aspect = 'aspect-[16/9]', hint }: ImageInputProps) {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    const shown = preview ?? (removed ? null : currentUrl);

    const pick = (files: FileList | null) => {
        const chosen = files?.[0];
        if (chosen && chosen.type.startsWith('image/')) onChange(chosen);
    };

    return (
        <div className="grid gap-2">
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => pick(e.target.files)}
            />

            {shown ? (
                <div className={cn('group bg-muted relative overflow-hidden rounded-2xl border', aspect)}>
                    <img src={shown} alt="Vista previa" className="size-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow hover:bg-neutral-100"
                        >
                            <RefreshCw className="size-3.5" /> Cambiar foto
                        </button>
                        {(file || onRemove) && (
                            <button
                                type="button"
                                onClick={() => (file ? onChange(null) : onRemove?.())}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-red-600 shadow hover:bg-red-50"
                            >
                                <Trash2 className="size-3.5" /> Quitar
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <label
                    htmlFor={id}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        pick(e.dataTransfer.files);
                    }}
                    className={cn(
                        'text-muted-foreground hover:border-primary hover:text-primary flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
                        aspect,
                        dragging && 'border-primary bg-primary/5 text-primary',
                    )}
                >
                    <ImagePlus className="size-8" />
                    <span className="text-sm font-semibold">Elige una foto o arrástrala aquí</span>
                    <span className="text-xs">JPG, PNG o WebP · máximo 8 MB</span>
                </label>
            )}
            {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
        </div>
    );
}
