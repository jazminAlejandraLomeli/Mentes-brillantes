@php($brand = \App\Support\BrandAssets::urls())
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ \App\Support\SiteConfig::fullName() }}</title>

        {{-- Icono de la pestaña: el logo subido en el panel, o el arcoíris por defecto --}}
        <link rel="icon" href="{{ $brand['icon_url'] }}">
        @if ($brand['apple_icon_url'])
            <link rel="apple-touch-icon" href="{{ $brand['apple_icon_url'] }}">
        @endif

        {{-- Tipografías y colores elegidos en el panel (ver App\Support\Theme) --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="{{ \App\Support\Theme::googleFontsUrl() }}" rel="stylesheet" />
        {!! \App\Support\Theme::styleTag() !!}

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-body antialiased">
        @inertia
    </body>
</html>
