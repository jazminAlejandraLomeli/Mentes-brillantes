<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * En la demo nadie puede cambiar el correo ni la contraseña del panel
 * (si no, el siguiente visitante ya no podría entrar).
 */
class BlockInDemo
{
    public function handle(Request $request, Closure $next): Response
    {
        if (config('app.demo')) {
            return back()->with('error', 'En la demo no se puede cambiar el usuario ni la contraseña.');
        }

        return $next($request);
    }
}
