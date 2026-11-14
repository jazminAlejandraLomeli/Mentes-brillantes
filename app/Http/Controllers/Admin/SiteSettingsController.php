<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ThemeRequest;
use App\Http\Requests\Admin\WhatsAppTemplatesRequest;
use App\Services\SiteSettingsService;
use App\Support\Theme;
use App\Support\WhatsAppTemplates;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "Personalizar": colores, tipos de letra y mensajes de WhatsApp.
 */
class SiteSettingsController extends Controller
{
    public function __construct(private SiteSettingsService $settings) {}

    public function appearance(): Response
    {
        return Inertia::render('admin/settings/appearance', [
            'current' => Theme::current(),
            'defaults' => Theme::defaults(),
            ...Theme::options(),
        ]);
    }

    public function updateAppearance(ThemeRequest $request): RedirectResponse
    {
        $this->settings->updateTheme($request->validated());

        return back()->with('success', '¡Listo! La página ya tiene los nuevos colores 🎨');
    }

    public function resetAppearance(): RedirectResponse
    {
        $this->settings->resetTheme();

        return back()->with('success', 'Se restauraron los colores originales.');
    }

    public function messages(): Response
    {
        return Inertia::render('admin/settings/messages', [
            'templates' => WhatsAppTemplates::all(),
            'defaults' => WhatsAppTemplates::DEFAULTS,
            'variables' => WhatsAppTemplates::VARIABLES,
        ]);
    }

    public function updateMessages(WhatsAppTemplatesRequest $request): RedirectResponse
    {
        $this->settings->updateWhatsAppTemplates($request->validated());

        return back()->with('success', 'Mensajes guardados.');
    }
}
