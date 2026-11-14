<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Cada clase individual en la agenda
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('appointment_series_id')->nullable()->constrained()->nullOnDelete();
            $table->string('subject', 120)->nullable();             // ej. "Matemáticas", "Lectoescritura"
            $table->dateTime('starts_at');
            $table->unsignedSmallInteger('duration_minutes')->default(60);
            $table->string('status', 20)->default('pending');       // App\Enums\AppointmentStatus
            $table->text('notes')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();      // último recordatorio por WhatsApp
            $table->timestamps();

            $table->index(['starts_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
