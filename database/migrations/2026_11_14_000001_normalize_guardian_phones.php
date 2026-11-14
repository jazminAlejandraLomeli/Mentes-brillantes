<?php

use App\Support\PhoneNumber;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Deja los teléfonos ya guardados en el mismo formato que los nuevos:
     * 10 dígitos sin espacios ("55 1234 5678" → "5512345678").
     * Los que no tengan 10 dígitos se dejan como están para revisarlos a mano.
     */
    public function up(): void
    {
        DB::table('guardians')->orderBy('id')->each(function (object $guardian): void {
            $normalized = PhoneNumber::normalize($guardian->whatsapp_phone);

            if ($normalized !== null && $normalized !== $guardian->whatsapp_phone) {
                DB::table('guardians')->where('id', $guardian->id)->update(['whatsapp_phone' => $normalized]);
            }
        });
    }

    public function down(): void
    {
        // No hace falta revertir: el formato con espacios era solo visual.
    }
};
