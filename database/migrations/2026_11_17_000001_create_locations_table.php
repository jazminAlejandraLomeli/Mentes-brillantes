<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sucursales: dirección, horario y mapa en la sección "Visítanos" de la página.
     * Más adelante una clase podrá ligarse a una sucursal (location_id en appointments).
     */
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120)->nullable();         // "Sucursal Centro" (opcional si solo hay una)
            $table->string('address', 300);                  // calle, número, colonia, ciudad
            $table->string('landmark', 200)->nullable();   // "Frente al parque, segundo piso"
            $table->text('schedule')->nullable();            // un horario por renglón
            $table->string('whatsapp_phone', 25)->nullable(); // si es distinto al general
            $table->string('maps_url', 500)->nullable();     // enlace "Compartir" de Google Maps
            $table->boolean('is_active')->default(true);     // se muestra en la página
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
