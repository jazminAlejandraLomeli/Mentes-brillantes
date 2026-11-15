<?php

namespace App\Support;

use App\Models\Setting;

/**
 * Plantillas de mensajes de WhatsApp que Liz puede editar desde el panel.
 *
 * Variables: {tutor} {alumno} {clase} {fecha} {hora} {firma} {maestro}
 */
class WhatsAppTemplates
{
    public const SETTING_KEY = 'whatsapp_templates';

    public const REMINDER = 'reminder';

    public const CANCELLATION = 'cancellation';

    public const RESCHEDULE = 'reschedule';

    /** @var array<string, string> */
    public const DEFAULTS = [
        self::REMINDER => '¡Hola {tutor}! Te saluda {firma} 🌟. Te escribo para confirmar la clase de {clase} de {alumno} el día {fecha} a las {hora}. ¿Me confirmas si asistirán o si necesitamos reagendar? ¡Gracias!',
        self::CANCELLATION => '¡Hola {tutor}! Te saluda {firma} 🌟. Te aviso que la clase de {clase} de {alumno} del día {fecha} a las {hora} queda cancelada. Si quieres, buscamos otro horario para reponerla. ¡Gracias por tu comprensión!',
        self::RESCHEDULE => '¡Hola {tutor}! Te saluda {firma} 🌟. La clase de {clase} de {alumno} quedó reagendada para el día {fecha} a las {hora}. ¿Les queda bien? ¡Gracias!',
    ];

    /** @var list<string> */
    public const VARIABLES = ['tutor', 'alumno', 'clase', 'fecha', 'hora', 'firma', 'maestro'];

    /**
     * @return array<string, string>
     */
    public static function all(): array
    {
        $saved = Setting::getValue(self::SETTING_KEY, []);

        return array_merge(self::DEFAULTS, array_intersect_key(
            array_filter(is_array($saved) ? $saved : [], fn ($text) => is_string($text) && trim($text) !== ''),
            self::DEFAULTS,
        ));
    }

    public static function get(string $type): string
    {
        return self::all()[$type] ?? self::DEFAULTS[self::REMINDER];
    }

    /**
     * Reemplaza {variables} por sus valores.
     *
     * @param  array<string, string>  $values
     */
    public static function render(string $template, array $values): string
    {
        return strtr($template, collect($values)->mapWithKeys(fn ($v, $k) => ['{'.$k.'}' => $v])->all());
    }
}
