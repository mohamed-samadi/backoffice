<?php

$envOrigins = env('CORS_ALLOWED_ORIGINS');

// Ensure each origin is a clean single-line string (no CR/LF) to avoid
// Symfony's "Header may not contain more than a single header" exception.
$allowedOrigins = $envOrigins
    ? array_values(array_filter(array_map(
        static fn ($origin) => trim(str_replace(["\r", "\n"], '', (string) $origin)),
        preg_split('/[\s,]+/', (string) $envOrigins, -1, PREG_SPLIT_NO_EMPTY) ?: []
    )))
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
    ];

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    // ✅ أضفنا مسارات الـ login والـ logout لحمايتها من الـ CORS أيضاً
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    // ✅ التعديل الجوهري: كل رابط أصبح عنصراً مستقلاً ونظيفاً تماماً بدون أسطر خفية
    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];