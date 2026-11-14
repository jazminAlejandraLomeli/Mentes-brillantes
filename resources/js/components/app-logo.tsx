import { RainbowMark } from '@/components/brand/rainbow-mark';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-black/5">
                <RainbowMark className="h-4" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm leading-tight">
                <span className="font-heading text-brand-primary-strong truncate font-bold">Mentes Brillantes</span>
                <span className="text-muted-foreground truncate text-xs">Panel de Liz</span>
            </div>
        </>
    );
}
