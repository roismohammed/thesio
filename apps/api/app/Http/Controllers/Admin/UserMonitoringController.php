<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SubscriptionStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserMonitoringController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $now = Carbon::now();
        $query = User::query()
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'super admin');
            })
            ->with([
                'subscriptions' => function ($q) use ($now) {
                    $q->where('status', SubscriptionStatusEnum::ACTIVE->value)
                        ->where('starts_at', '<=', $now)
                        ->where('ends_at', '>=', $now)
                        ->with('plan')
                        ->orderByDesc('ends_at');
                },
                'payments' => function ($q) {
                    $q->with('plan')->orderByDesc('created_at');
                },
            ]);

        // Filter by search name/email
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by plan_id
        if ($planId = $request->query('plan_id')) {
            $query->whereHas('subscriptions', function ($q) use ($planId, $now) {
                $q->where('plan_id', $planId)
                    ->where('status', SubscriptionStatusEnum::ACTIVE->value)
                    ->where('starts_at', '<=', $now)
                    ->where('ends_at', '>=', $now);
            });
        }

        // Filter by subscription type/status
        if ($status = $request->query('status')) {
            if ($status === 'active') {
                $query->whereHas('subscriptions', function ($q) use ($now) {
                    $q->where('status', SubscriptionStatusEnum::ACTIVE->value)
                        ->where('starts_at', '<=', $now)
                        ->where('ends_at', '>=', $now);
                });
            } elseif ($status === 'no_active') {
                $query->whereDoesntHave('subscriptions', function ($q) use ($now) {
                    $q->where('status', SubscriptionStatusEnum::ACTIVE->value)
                        ->where('starts_at', '<=', $now)
                        ->where('ends_at', '>=', $now);
                });
            }
        }

        $users = $query->paginate(25);

        // Map users to clean DTO structure
        $users->getCollection()->transform(function (User $user) {
            $activeSub = $user->subscriptions->first();

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_disabled' => $user->is_disabled,
                'created_at' => $user->created_at,
                'active_subscription' => $activeSub ? [
                    'id' => $activeSub->id,
                    'type' => $activeSub->type,
                    'status' => $activeSub->status,
                    'starts_at' => $activeSub->starts_at,
                    'ends_at' => $activeSub->ends_at,
                    'plan' => $activeSub->plan ? [
                        'id' => $activeSub->plan->id,
                        'name' => $activeSub->plan->name,
                        'price' => $activeSub->plan->price,
                    ] : null,
                ] : null,
                'payments_count' => $user->payments->count(),
            ];
        });

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $now = Carbon::now();
        $user->load([
            'subscriptions' => function ($q) {
                $q->with('plan.permissions')->orderByDesc('created_at');
            },
            'payments' => function ($q) {
                $q->with('plan')->orderByDesc('created_at');
            },
        ]);

        $activeSub = $user->subscriptions
            ->filter(fn ($sub) => $sub->status === SubscriptionStatusEnum::ACTIVE && $sub->starts_at <= $now && $sub->ends_at >= $now)
            ->first();

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_disabled' => $user->is_disabled,
                    'created_at' => $user->created_at,
                ],
                'active_subscription' => $activeSub,
                'all_subscriptions' => $user->subscriptions,
                'payments' => $user->payments,
            ],
        ]);
    }
}
