import { useLayoutEffect } from 'react';

/**
 * Mientras la pantalla está abierta, la muestra en modo claro aunque el
 * panel esté en oscuro (la página pública y el login usan los colores pastel).
 *
 * Se hace antes de pintar (useLayoutEffect) y sin transiciones, para que los
 * botones no se queden "a medio cambiar" de color oscuro a claro.
 */
export function useForceLightMode() {
    useLayoutEffect(() => {
        const root = document.documentElement;
        const hadDark = root.classList.contains('dark');

        root.classList.add('no-transitions');
        root.classList.remove('dark');
        const frame = requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('no-transitions')));

        return () => {
            cancelAnimationFrame(frame);
            root.classList.remove('no-transitions');
            root.classList.toggle('dark', hadDark);
        };
    }, []);
}
