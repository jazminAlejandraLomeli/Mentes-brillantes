import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

/**
 * <select> nativo con el estilo del panel. En el celular abre el selector
 * del sistema, que es más cómodo que un menú personalizado.
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(({ className, children, ...props }, ref) => (
    <div className="relative">
        <select
            ref={ref}
            className={cn(
                'border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full appearance-none rounded-md border bg-transparent py-1 pr-9 pl-3 text-base shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50 md:text-sm',
                className,
            )}
            {...props}
        >
            {children}
        </select>
        <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
));
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
