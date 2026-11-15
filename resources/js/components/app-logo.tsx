import { BrandMark } from '@/components/brand/brand-logo';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { site } = usePage<SharedData>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                <BrandMark square className="h-6 w-6" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="font-heading text-brand-primary-strong truncate font-bold">{site.business.name}</span>
                <span className="text-muted-foreground truncate text-xs">Panel de {site.business.owner}</span>
            </div>
        </>
    );
}
