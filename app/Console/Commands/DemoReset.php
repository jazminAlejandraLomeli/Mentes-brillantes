<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * Deja la demo como nueva: borra lo que subieron los visitantes y vuelve a
 * cargar los datos de ejemplo. Solo funciona con APP_DEMO=true, para que
 * nunca se pueda correr por error en el sitio real de un cliente.
 */
class DemoReset extends Command
{
    protected $signature = 'demo:reset {--force : No preguntar (para el cron)}';

    protected $description = 'Reinicia la demo con los datos de ejemplo (solo si APP_DEMO=true)';

    /** Carpetas de fotos que se vacían (todo lo que se sube desde el panel) */
    private const FOLDERS = ['banners', 'services', 'events', 'gallery', 'teachers', 'brand'];

    public function handle(): int
    {
        if (! config('app.demo')) {
            $this->error('Este sitio NO está en modo demo (APP_DEMO=true). No se borró nada.');

            return self::FAILURE;
        }

        if (! $this->option('force') && ! $this->confirm('Se borrarán todos los datos y fotos de la demo. ¿Continuar?')) {
            return self::SUCCESS;
        }

        $disk = Storage::disk('public');
        foreach (self::FOLDERS as $folder) {
            $disk->deleteDirectory($folder);
        }

        $this->call('migrate:fresh', ['--seed' => true, '--force' => true]);
        Cache::flush();

        $this->info('✨ Demo reiniciada con los datos de ejemplo.');

        return self::SUCCESS;
    }
}
