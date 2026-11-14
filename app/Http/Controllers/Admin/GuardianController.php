<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GuardianRequest;
use App\Models\Guardian;
use Illuminate\Http\RedirectResponse;

/**
 * Editar datos del tutor (nombre, WhatsApp, correo). Se hace desde la ficha del alumno.
 */
class GuardianController extends Controller
{
    public function update(GuardianRequest $request, Guardian $guardian): RedirectResponse
    {
        $guardian->update($request->validated());

        return back()->with('success', 'Datos del tutor actualizados.');
    }
}
