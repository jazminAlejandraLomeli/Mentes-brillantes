<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Clases de regularización, talleres y cursos de verano
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('title', 120);
            $table->string('slug', 140)->unique();
            $table->string('category', 30);                 // key de config/site.json → categories
            $table->string('short_description', 255);
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('age_min')->nullable();
            $table->unsignedTinyInteger('age_max')->nullable();
            $table->string('modality', 20);                 // App\Enums\Modality
            $table->decimal('price', 8, 2)->nullable();
            $table->string('price_note', 60)->nullable();   // ej. "por sesión", "paquete de 8 clases"
            $table->boolean('show_price')->default(false);  // Liz decide si el precio se ve en la página
            $table->string('image_path')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'category', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
