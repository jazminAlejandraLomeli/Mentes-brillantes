<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Maestros (solo se usan si config/site.json → features.multi_teacher = true).
     *
     * user_id queda listo para el futuro: cuando cada maestro tenga su propio
     * login, se liga su ficha a su usuario sin tocar las clases ya agendadas.
     */
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name', 120);                 // "Miss Karla"
            $table->string('color', 7)->default('#4BBBE5'); // color en el calendario
            $table->string('whatsapp_phone', 25)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::table('appointment_series', function (Blueprint $table) {
            $table->foreignId('teacher_id')->nullable()->after('service_id')->constrained()->nullOnDelete();
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('teacher_id')->nullable()->after('service_id')->constrained()->nullOnDelete();
            $table->index(['teacher_id', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['teacher_id', 'starts_at']);
            $table->dropConstrainedForeignId('teacher_id');
        });

        Schema::table('appointment_series', function (Blueprint $table) {
            $table->dropConstrainedForeignId('teacher_id');
        });

        Schema::dropIfExists('teachers');
    }
};
