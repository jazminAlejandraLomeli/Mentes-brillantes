<?php

namespace Tests\Unit;

use App\Support\Color;
use App\Support\PhoneNumber;
use App\Support\Theme;
use PHPUnit\Framework\TestCase;

class ThemeAndPhoneTest extends TestCase
{
    public function test_normaliza_celulares_de_mexico_a_10_digitos(): void
    {
        $this->assertSame('3781220818', PhoneNumber::normalize('378 122 0818'));
        $this->assertSame('3312345678', PhoneNumber::normalize('(33) 1234-5678'));
        $this->assertSame('3312345678', PhoneNumber::normalize('+52 33 1234 5678'));
        $this->assertSame('3312345678', PhoneNumber::normalize('+52 1 33 1234 5678'));
    }

    public function test_rechaza_numeros_que_no_tienen_10_digitos(): void
    {
        $this->assertNull(PhoneNumber::normalize('12345'));
        $this->assertNull(PhoneNumber::normalize('33123456789'));      // 11
        $this->assertNull(PhoneNumber::normalize('331234567890123'));  // 15
        $this->assertNull(PhoneNumber::normalize('abcdefghij'));
        $this->assertNull(PhoneNumber::normalize(''));
    }

    public function test_los_telefonos_quedan_listos_para_wa_me(): void
    {
        $this->assertSame('523312345678', PhoneNumber::forWhatsApp('33 1234 5678'));
        $this->assertSame('523312345678', PhoneNumber::forWhatsApp('+52 1 33 1234 5678'));
        $this->assertSame('378 122 0818', PhoneNumber::format('3781220818'));
    }

    public function test_todos_los_pasteles_tienen_version_legible_con_letra_blanca(): void
    {
        foreach (Theme::PRESETS as $preset) {
            foreach (['primary', 'secondary', 'accent'] as $key) {
                $strong = Color::readableOnWhite($preset[$key]);

                $this->assertGreaterThanOrEqual(4.5, Color::contrast($strong, '#FFFFFF'), "{$preset['label']} / {$key}");
            }
        }
    }
}
