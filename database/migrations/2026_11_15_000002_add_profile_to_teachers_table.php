<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Perfil público del maestro para la sección "Conoce a tu maestra" de la página.
     */
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('full_name', 150)->nullable()->after('name');   // "Lizbeth González Ulloa"
            $table->string('title', 150)->nullable()->after('full_name');  // "Licenciada en Pedagogía"
            $table->string('photo_path')->nullable()->after('title');
            $table->text('bio')->nullable()->after('photo_path');          // trayectoria
            $table->text('education')->nullable()->after('bio');           // formación, un renglón por estudio
            $table->json('specialties')->nullable()->after('education');   // ["Lectura", "Matemáticas"]
            $table->boolean('show_on_website')->default(true)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['full_name', 'title', 'photo_path', 'bio', 'education', 'specialties', 'show_on_website']);
        });
    }
};
