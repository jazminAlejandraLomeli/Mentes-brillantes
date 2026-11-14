<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Support\Carbon;

/**
 * Arma enlaces click-to-chat de WhatsApp.
 * No envía nada por sí solo: abre WhatsApp con el mensaje ya escrito
 * para que Liz lo revise y lo mande.
 *
 * Se usa api.whatsapp.com/send y NO wa.me: wa.me redirige y en esa
 * redirección los emojis (🌟) llegan rotos como "�" en WhatsApp Web
 * y de escritorio.
 */
class WhatsAppLink
{
    public const BASE_URL = 'https://api.whatsapp.com/send';

    public static function to(string $phone, string $message = ''): string
    {
        $query = 'phone='.PhoneNumber::forWhatsApp($phone);

        if ($message !== '') {
            $query .= '&text='.rawurlencode($message);
        }

        return self::BASE_URL.'?'.$query;
    }

    /**
     * Mensaje para una cita (recordatorio, cancelación o reagendado).
     */
    public static function messageForAppointment(Appointment $appointment, string $type): string
    {
        $appointment->loadMissing('student.guardian', 'service');

        return WhatsAppTemplates::render(WhatsAppTemplates::get($type), [
            'tutor' => $appointment->student->guardian->firstName(),
            'alumno' => $appointment->student->firstName(),
            'clase' => $appointment->topic(),
            'fecha' => self::formatDate($appointment->starts_at),
            'hora' => self::formatTime($appointment->starts_at),
            'firma' => (string) SiteConfig::get('business.signature', 'Liz de Mentes Brillantes'),
        ]);
    }

    public static function forAppointment(Appointment $appointment, string $type): string
    {
        $appointment->loadMissing('student.guardian');

        return self::to(
            $appointment->student->guardian->whatsapp_phone,
            self::messageForAppointment($appointment, $type),
        );
    }

    /**
     * Botón "Pedir informes" de la página pública.
     */
    public static function contact(?Service $service = null): string
    {
        $message = $service
            ? "¡Hola! Me interesa «{$service->title}» de Mentes Brillantes. ¿Me podrías dar más informes? 🌟"
            : (string) SiteConfig::get('whatsapp.default_message', '¡Hola! Me gustaría pedir informes 🌟');

        return self::to(SiteConfig::whatsappPhone(), $message);
    }

    /** "lunes 16 de noviembre" */
    public static function formatDate(Carbon $date): string
    {
        return $date->copy()->locale('es')->isoFormat('dddd D [de] MMMM');
    }

    /** "5:00 pm" */
    public static function formatTime(Carbon $date): string
    {
        return $date->format('g:i').' '.($date->hour < 12 ? 'am' : 'pm');
    }
}
