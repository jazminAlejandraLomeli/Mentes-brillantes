<?php

namespace App\Http\Middleware;

use App\Support\BrandAssets;
use App\Support\SiteConfig;
use App\Support\Theme;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => SiteConfig::fullName(),
            'auth' => [
                'user' => $request->user(),
            ],
            // Datos de config/site.json (WhatsApp, redes, nombre del negocio)
            'site' => fn () => SiteConfig::all(),
            // Logo e icono subidos desde el panel
            'brand' => fn () => BrandAssets::urls(),
            // Tema actual; el panel lo usa para mostrar la vista previa
            'theme' => fn () => Theme::current(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                // Botón sugerido para avisar por WhatsApp: { label, url, appointment_id }
                'whatsapp' => fn () => $request->session()->get('whatsapp'),
            ],
        ];
    }
}
