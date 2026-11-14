<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Mamás, papás o tutores. Uno puede tener varios niños inscritos.
        Schema::create('guardians', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('whatsapp_phone', 25);
            $table->string('email', 150)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guardians');
    }
};
