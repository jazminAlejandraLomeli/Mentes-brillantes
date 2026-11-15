import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

// El nombre del negocio viene de config/site.json (se manda en la primera carga de la página)
const initialPage = JSON.parse(document.getElementById('app')?.dataset.page ?? '{}');
const appName: string = initialPage?.props?.name || import.meta.env.VITE_APP_NAME || 'Mi escuela';

createInertiaApp({
    title: (title) => (title ? `${title} · ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#F784B0',
    },
});

// This will set light / dark mode on load...
initializeTheme();
