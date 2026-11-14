<?php

namespace App\Rules;

use App\Support\PhoneNumber;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Celular de México: exactamente 10 dígitos (se acepta que traiga +52).
 */
class MexicanPhone implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (PhoneNumber::normalize(is_scalar($value) ? (string) $value : null) === null) {
            $fail('El WhatsApp debe tener 10 dígitos, por ejemplo 378 122 0818.');
        }
    }
}
