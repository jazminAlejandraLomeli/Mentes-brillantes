<?php

namespace App\Http\Requests\Admin;

use App\Support\WhatsAppTemplates;

class WhatsAppTemplatesRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return collect(array_keys(WhatsAppTemplates::DEFAULTS))
            ->mapWithKeys(fn (string $key) => [$key => ['required', 'string', 'max:1000']])
            ->all();
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            WhatsAppTemplates::REMINDER => 'mensaje de recordatorio',
            WhatsAppTemplates::CANCELLATION => 'mensaje de cancelación',
            WhatsAppTemplates::RESCHEDULE => 'mensaje de reagendado',
        ];
    }
}
