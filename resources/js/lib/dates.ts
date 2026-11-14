/**
 * Fechas "YYYY-MM-DD" sin líos de zona horaria (siempre en hora local).
 */

export function parseISODate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function addDays(iso: string, days: number): string {
    const d = parseISODate(iso);
    d.setDate(d.getDate() + days);
    return toISODate(d);
}

export function addMonths(iso: string, months: number): string {
    const d = parseISODate(iso);
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    return toISODate(d);
}

/** Todos los días entre dos fechas (incluidas). */
export function daysBetween(from: string, to: string): string[] {
    const days: string[] = [];
    for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
    return days;
}

export function formatDay(iso: string, options: Intl.DateTimeFormatOptions): string {
    return parseISODate(iso).toLocaleDateString('es-MX', options);
}

export const todayString = () => toISODate(new Date());
