import { RainbowMark } from '@/components/brand/rainbow-mark';
import { type ReactNode } from 'react';

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="bg-card flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center">
            <RainbowMark className="mb-4 h-10 opacity-80" />
            <h2 className="font-heading text-lg font-bold">{title}</h2>
            {description && <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
