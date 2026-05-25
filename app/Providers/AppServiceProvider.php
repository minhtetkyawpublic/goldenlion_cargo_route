<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $appUrl = rtrim((string) config('app.url', ''), '/');
        $appPath = (string) parse_url($appUrl ?: '/', PHP_URL_PATH);
        $basePath = $appPath && $appPath !== '/' ? rtrim($appPath, '/') : '';

        if ($appUrl !== '') {
            URL::forceRootUrl($appUrl);

            $scheme = parse_url($appUrl, PHP_URL_SCHEME);

            if (is_string($scheme) && $scheme !== '') {
                URL::forceScheme($scheme);
            }
        }

        Inertia::share('app', [
            'url' => $appUrl,
            'basePath' => $basePath,
        ]);
    }
}
