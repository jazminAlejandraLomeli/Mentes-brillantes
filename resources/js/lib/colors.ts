/**
 * Mismas cuentas que App\Support\Color (PHP), para la vista previa en vivo.
 */

function toRgb(hex: string): [number, number, number] {
    let h = hex.replace('#', '');
    if (h.length === 3)
        h = h
            .split('')
            .map((c) => c + c)
            .join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function toHex([r, g, b]: number[]): string {
    return (
        '#' +
        [r, g, b]
            .map((c) =>
                Math.round(Math.max(0, Math.min(255, c)))
                    .toString(16)
                    .padStart(2, '0'),
            )
            .join('')
            .toUpperCase()
    );
}

export function mix(a: string, b: string, amount: number): string {
    const ca = toRgb(a);
    const cb = toRgb(b);
    return toHex(ca.map((c, i) => c + (cb[i] - c) * amount));
}

function luminance(hex: string): number {
    const [r, g, b] = toRgb(hex).map((c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
}

/** Oscurece el color hasta que la letra blanca encima se lea bien. */
export function readableOnWhite(hex: string, min = 4.5): string {
    let color = hex.toUpperCase();
    for (let i = 0; i < 20 && contrast(color, '#FFFFFF') < min; i++) color = mix(color, '#000000', 0.06);
    return color;
}

export const isHex = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);
