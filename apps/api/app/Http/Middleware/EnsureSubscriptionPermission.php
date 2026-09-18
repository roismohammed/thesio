<?php

namespace App\Http\Middleware;

use App\Support\PermissionResolver;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (! PermissionResolver::hasActiveAccess($user, $permission)) {
            return response()->json([
                'message' => "Akses ditolak. Fitur ini memerlukan paket langganan aktif dengan izin '{$permission}'.",
                'code' => 'SUBSCRIPTION_PERMISSION_REQUIRED',
                'required_permission' => $permission,
            ], 403);
        }

        return $next($request);
    }
}
