<?php

namespace App\Providers;

use App\Support\SiteConfig;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Los Resources llegan a React sin el envoltorio { data: ... }
        JsonResource::withoutWrapping();

        // Fechas en español ("lunes 16 de noviembre")
        Carbon::setLocale(config('app.locale', 'es'));

        // El nombre del negocio sale de config/site.json (lo usan los correos y los títulos)
        config(['app.name' => SiteConfig::fullName()]);

        // Correo de "¿Olvidaste tu contraseña?" con un tono más cercano
        ResetPassword::toMailUsing(function (object $notifiable, string $token): MailMessage {
            $url = url(route('password.reset', ['token' => $token, 'email' => $notifiable->getEmailForPasswordReset()], false));
            $minutes = config('auth.passwords.'.config('auth.defaults.passwords').'.expire');

            return (new MailMessage)
                ->subject('Recupera tu contraseña · '.SiteConfig::name())
                ->greeting('¡Hola, '.strtok((string) $notifiable->name, ' ').'! 🌈')
                ->line('Recibimos una solicitud para cambiar la contraseña de tu panel de '.SiteConfig::name().'.')
                ->action('Crear contraseña nueva', $url)
                ->line("Este enlace funciona durante {$minutes} minutos.")
                ->line('Si tú no lo pediste, no tienes que hacer nada: tu contraseña sigue igual.')
                ->salutation('Con cariño, '.SiteConfig::name().' ✨');
        });
    }
}
