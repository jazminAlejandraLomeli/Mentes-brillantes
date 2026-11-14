<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Clases que se repiten: "Sofía, matemáticas, lunes y miércoles 5:00 pm, 10 sesiones".
        // Al guardar una serie se crean sus citas individuales en `appointments`,
        // así cada una se puede confirmar, cancelar o mover por separado.
        Schema::create('appointment_series', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject', 120)->nullable();
            $table->json('weekdays');                          // [1, 3] = lunes y miércoles (ISO: 1=lunes … 7=domingo)
            $table->time('start_time');
            $table->unsignedSmallInteger('duration_minutes')->default(60);
            $table->date('starts_on');
            $table->unsignedSmallInteger('sessions_count')->nullable(); // termina después de N clases…
            $table->date('ends_on')->nullable();                        // …o en esta fecha
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_series');
    }
};
