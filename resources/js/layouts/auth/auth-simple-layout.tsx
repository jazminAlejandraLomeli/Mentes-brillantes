import { RainbowMark } from '@/components/brand/rainbow-mark';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="bg-brand-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8 rounded-3xl bg-white p-7 shadow-xl ring-1 shadow-black/5 ring-black/5 sm:p-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2">
                            <RainbowMark className="h-10" />
                            <span className="font-heading text-brand-primary-strong text-lg font-bold">Mentes Brillantes</span>
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="font-heading text-brand-text text-xl font-bold">{title}</h1>
                            <p className="text-center text-sm text-neutral-500">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
                <p className="mt-6 text-center text-sm">
                    <Link href={route('home')} className="text-brand-text/60 hover:text-brand-text underline-offset-4 hover:underline">
                        ← Volver a la página
                    </Link>
                </p>
            </div>
        </div>
    );
}
