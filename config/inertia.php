<?php

/*
 * Solo cambia dónde buscan las pruebas las páginas de React.
 * Inertia las busca por defecto en "js/Pages" (con mayúscula); aquí la
 * carpeta es "js/pages". En la Mac da igual, pero en Linux (GitHub Actions,
 * Hostinger) las mayúsculas importan y las pruebas fallaban.
 * El resto de la configuración de Inertia queda con sus valores por defecto.
 */
return [

    'testing' => [
        'ensure_pages_exist' => true,
        'page_paths' => [
            resource_path('js/pages'),
        ],
        'page_extensions' => ['js', 'jsx', 'ts', 'tsx'],
    ],

];
