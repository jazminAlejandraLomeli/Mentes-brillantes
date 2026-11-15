import { Switch } from '@/components/ui/switch';
import { router } from '@inertiajs/react';
import { useState } from 'react';

/**
 * Switch "visible en la página" que guarda al instante.
 */
export function VisibilityToggle({
    url,
    visible,
    label,
    onText = 'Visible',
    offText = 'Oculto',
}: {
    url: string;
    visible: boolean;
    label: string;
    onText?: string;
    offText?: string;
}) {
    const [busy, setBusy] = useState(false);

    return (
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <Switch
                checked={visible}
                disabled={busy}
                label={label}
                onCheckedChange={() => {
                    setBusy(true);
                    router.patch(url, {}, { preserveScroll: true, onFinish: () => setBusy(false) });
                }}
            />
            <span className={visible ? 'font-semibold' : 'text-muted-foreground'}>{visible ? onText : offText}</span>
        </label>
    );
}
