<?php

use App\Http\Middleware\EnsureSubscriptionPermission;
use App\Http\Middleware\EnsureUserIsEnabled;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function (): void {
            require __DIR__.'/../routes/auth.php';
            require __DIR__.'/../routes/admin.php';
            require __DIR__.'/../routes/thesis.php';
            require __DIR__.'/../routes/plan.php';
            require __DIR__.'/../routes/webhook.php';
        },
    )
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('guidance:generate-scheduled')
            ->cron(config('openai.guidance.schedule'));
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'subscription.permission' => EnsureSubscriptionPermission::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return route('login');
        });

        $middleware->statefulApi();
        $middleware->append(EnsureUserIsEnabled::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
