<?php

use App\Http\Controllers\Admin\AppointmentController;
use App\Http\Controllers\Admin\AppointmentSeriesController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\GalleryItemController;
use App\Http\Controllers\Admin\GuardianController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SiteSettingsController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\LandingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Página pública
|--------------------------------------------------------------------------
*/

Route::get('/', LandingController::class)->name('home');

/*
|--------------------------------------------------------------------------
| Panel de Liz (/panel) — requiere iniciar sesión
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->prefix('panel')->group(function () {
    // El nombre "dashboard" lo usan las pantallas de la plantilla (login, menú…)
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::name('admin.')->group(function () {
        // --- Contenido de la página ---
        Route::patch('banners/{banner}/toggle', [BannerController::class, 'toggle'])->name('banners.toggle');
        Route::post('banners/reorder', [BannerController::class, 'reorder'])->name('banners.reorder');
        Route::resource('banners', BannerController::class)->except('show');

        Route::patch('services/{service}/toggle', [ServiceController::class, 'toggle'])->name('services.toggle');
        Route::post('services/reorder', [ServiceController::class, 'reorder'])->name('services.reorder');
        Route::resource('services', ServiceController::class)->except('show');

        Route::patch('events/{event}/toggle', [EventController::class, 'toggle'])->name('events.toggle');
        Route::resource('events', EventController::class)->except('show');

        Route::patch('gallery/{galleryItem}/toggle', [GalleryItemController::class, 'toggle'])->name('gallery.toggle');
        Route::post('gallery/reorder', [GalleryItemController::class, 'reorder'])->name('gallery.reorder');
        Route::resource('gallery', GalleryItemController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['gallery' => 'galleryItem']);

        // --- Sucursales (sección "Visítanos") ---
        Route::patch('locations/{location}/toggle', [LocationController::class, 'toggle'])->name('locations.toggle');
        Route::post('locations/reorder', [LocationController::class, 'reorder'])->name('locations.reorder');
        Route::resource('locations', LocationController::class)->except('show');

        // --- Alumnos y familias ---
        Route::resource('students', StudentController::class);
        Route::put('guardians/{guardian}', [GuardianController::class, 'update'])->name('guardians.update');

        // --- Maestros (perfil en la página; en salones con varios maestros, también en la agenda) ---
        Route::patch('teachers/{teacher}/toggle', [TeacherController::class, 'toggle'])->name('teachers.toggle');
        Route::patch('teachers/{teacher}/website', [TeacherController::class, 'toggleWebsite'])->name('teachers.website');
        Route::post('teachers/reorder', [TeacherController::class, 'reorder'])->name('teachers.reorder');
        Route::resource('teachers', TeacherController::class)->except('show');

        // --- Agenda ---
        Route::get('appointments', [AppointmentController::class, 'index'])->name('appointments.index');
        Route::post('appointments', [AppointmentController::class, 'store'])->name('appointments.store');
        Route::put('appointments/{appointment}', [AppointmentController::class, 'update'])->name('appointments.update');
        Route::patch('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('appointments.status');
        Route::post('appointments/{appointment}/reminder-sent', [AppointmentController::class, 'markReminderSent'])->name('appointments.reminder-sent');
        Route::delete('appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');

        Route::post('appointment-series', [AppointmentSeriesController::class, 'store'])->name('series.store');
        Route::patch('appointment-series/{series}/cancel', [AppointmentSeriesController::class, 'cancelRemaining'])->name('series.cancel');
        Route::delete('appointment-series/{series}', [AppointmentSeriesController::class, 'destroy'])->name('series.destroy');

        // --- Personalizar ---
        Route::get('settings/appearance', [SiteSettingsController::class, 'appearance'])->name('settings.appearance');
        Route::put('settings/appearance', [SiteSettingsController::class, 'updateAppearance'])->name('settings.appearance.update');
        Route::delete('settings/appearance', [SiteSettingsController::class, 'resetAppearance'])->name('settings.appearance.reset');
        Route::post('settings/logo', [SiteSettingsController::class, 'updateLogo'])->name('settings.logo.update');
        Route::delete('settings/logo', [SiteSettingsController::class, 'removeLogo'])->name('settings.logo.remove');
        Route::get('settings/messages', [SiteSettingsController::class, 'messages'])->name('settings.messages');
        Route::put('settings/messages', [SiteSettingsController::class, 'updateMessages'])->name('settings.messages.update');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
