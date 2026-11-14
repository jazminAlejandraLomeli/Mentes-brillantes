import { cn } from '@/lib/utils';
import { type AppointmentStatus } from '@/types/admin';

const styles: Record<AppointmentStatus, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    confirmed: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    cancelled: 'bg-rose-100 text-rose-700 line-through dark:bg-rose-500/15 dark:text-rose-300',
};

export const statusDot: Record<AppointmentStatus, string> = {
    pending: 'bg-amber-400',
    confirmed: 'bg-sky-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-rose-400',
};

export function StatusBadge({ status, label, className }: { status: AppointmentStatus; label: string; className?: string }) {
    return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold', styles[status], className)}>{label}</span>;
}
