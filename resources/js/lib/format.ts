const moneyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
});

/** "250.00" → "$250" */
export function formatPrice(price: string | number | null): string | null {
    if (price === null || price === '') {
        return null;
    }

    const value = typeof price === 'number' ? price : Number.parseFloat(price);

    return Number.isFinite(value) ? moneyFormatter.format(value) : null;
}

/** "2026-11-16" → { day: "16", month: "nov" } (sin problemas de zona horaria) */
export function dateBadge(date: string): { day: string; month: string } {
    const [year, month, day] = date.split('-').map(Number);
    const local = new Date(year, month - 1, day);

    return {
        day: String(local.getDate()),
        month: local.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
    };
}

/** ¿Es un enlace externo (WhatsApp, Instagram…)? */
export function isExternal(url: string): boolean {
    return /^https?:\/\//.test(url);
}
