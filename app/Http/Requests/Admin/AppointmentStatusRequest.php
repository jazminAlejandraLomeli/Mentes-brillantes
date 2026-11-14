<?php

namespace App\Http\Requests\Admin;

use App\Enums\AppointmentStatus;
use Illuminate\Validation\Rule;

class AppointmentStatusRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(AppointmentStatus::class)],
        ];
    }

    public function status(): AppointmentStatus
    {
        return AppointmentStatus::from($this->validated('status'));
    }
}
