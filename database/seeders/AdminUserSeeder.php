<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

/**
 * Crea la cuenta de Liz para entrar al panel.
 * Los datos salen del .env (ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD).
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('app.admin.email');
        $password = config('app.admin.password');

        if (blank($email) || blank($password)) {
            throw new RuntimeException('Define ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env antes de correr el seeder.');
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => config('app.admin.name', 'Liz'),
                'password' => $password, // el modelo User la encripta (cast "hashed")
                'email_verified_at' => now(),
            ],
        );
    }
}
