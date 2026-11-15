<?php

use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Tareas programadas
|--------------------------------------------------------------------------
| En Hostinger, un Cron Job cada minuto corre `php artisan schedule:run`
| y Laravel decide qué toca ejecutar.
*/

// Demo: cada noche a las 3:00 am vuelve a los datos de ejemplo
Schedule::command('demo:reset --force')
    ->dailyAt('03:00')
    ->when(fn () => (bool) config('app.demo'))
    ->withoutOverlapping();
