<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_el_correo_de_recuperacion_sale_en_espanol_y_con_el_enlace(): void
    {
        Notification::fake();
        $user = User::factory()->create(['name' => 'Liz González', 'email' => 'liz@ejemplo.com']);

        $this->post('/forgot-password', ['email' => 'liz@ejemplo.com'])->assertSessionHasNoErrors();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $mail = $notification->toMail($user);

            $this->assertSame('Recupera tu contraseña · Mentes Brillantes', $mail->subject);
            $this->assertSame('¡Hola, Liz! 🌈', $mail->greeting);
            $this->assertSame('Crear contraseña nueva', $mail->actionText);
            $this->assertStringContainsString('/reset-password/', $mail->actionUrl);

            return true;
        });
    }
}
