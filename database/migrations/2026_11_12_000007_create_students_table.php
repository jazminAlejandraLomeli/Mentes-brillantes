<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guardian_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('school_grade', 20);      // App\Enums\SchoolGrade
            $table->string('school_name', 150)->nullable();
            $table->date('birth_date')->nullable();
            $table->text('notes')->nullable();       // ej. "le cuesta la división", alergias…
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
