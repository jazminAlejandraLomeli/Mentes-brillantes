<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * php artisan migrate:fresh --seed
     *
     * En producción solo se corren AdminUserSeeder y SettingsSeeder:
     *   php artisan db:seed --class=AdminUserSeeder --force
     *   php artisan db:seed --class=SettingsSeeder --force
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            SettingsSeeder::class,
            ContentSeeder::class,
            AgendaSeeder::class,
        ]);
    }
}
