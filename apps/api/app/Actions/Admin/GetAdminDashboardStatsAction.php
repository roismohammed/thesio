<?php

namespace App\Actions\Admin;

use App\Enums\PaymentStatusEnum;
use App\Enums\SubscriptionStatusEnum;
use App\Enums\SubscriptionTypeEnum;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Thesis;
use App\Models\User;
use Carbon\Carbon;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class GetAdminDashboardStatsAction
{
    /**
     * Gather SaaS metrics, charts, breakdown, and recent transactions.
     *
     * @return array<string, mixed>
     */
    public function execute(): array
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();

        // 1. SaaS essential metrics
        $mrr = (int) Subscription::query()
            ->where('subscriptions.status', SubscriptionStatusEnum::ACTIVE->value)
            ->where('subscriptions.type', SubscriptionTypeEnum::PAID->value)
            ->where('subscriptions.starts_at', '<=', $now)
            ->where('subscriptions.ends_at', '>=', $now)
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->sum('plans.price');

        $totalRevenue = (int) Payment::query()
            ->where('status', PaymentStatusEnum::PAID->value)
            ->sum('amount');

        $activeSubscriptionsCount = Subscription::query()
            ->where('status', SubscriptionStatusEnum::ACTIVE->value)
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now)
            ->count();

        $paidSubscriptionsCount = Subscription::query()
            ->where('status', SubscriptionStatusEnum::ACTIVE->value)
            ->where('type', SubscriptionTypeEnum::PAID->value)
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now)
            ->count();

        $trialSubscriptionsCount = Subscription::query()
            ->where('status', SubscriptionStatusEnum::ACTIVE->value)
            ->where('type', SubscriptionTypeEnum::TRIAL->value)
            ->where('starts_at', '<=', $now)
            ->where('ends_at', '>=', $now)
            ->count();

        $nonAdminUserQuery = fn () => User::query()
            ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'super admin'));

        $totalUsersCount = $nonAdminUserQuery()->count();

        $newUsersThisMonth = $nonAdminUserQuery()
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        // ponytail: include legacy in_progress alongside status pipeline: draft, proposal, research, writing, review
        $thesesQuery = Thesis::withoutGlobalScopes();
        $totalThesesCount = (clone $thesesQuery)->count();
        $activeThesesCount = (clone $thesesQuery)
            ->whereIn('status', ['draft', 'proposal', 'research', 'writing', 'review', 'in_progress'])
            ->count();

        // 2. Monthly chart data (last 6 months to current month)
        $monthlyData = $this->buildMonthlyChartData($sixMonthsAgo, $now);

        // 3. Subscription plans breakdown
        $planBreakdown = Plan::query()
            ->withCount([
                'subscriptions as active_users_count' => function ($q) use ($now) {
                    $q->where('status', SubscriptionStatusEnum::ACTIVE->value)
                        ->where('starts_at', '<=', $now)
                        ->where('ends_at', '>=', $now);
                },
            ])
            ->withSum([
                'payments as total_revenue' => function ($q) {
                    $q->where('status', PaymentStatusEnum::PAID->value);
                },
            ], 'amount')
            ->get()
            ->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => (int) $plan->price,
                'active_users_count' => (int) $plan->active_users_count,
                'total_revenue' => (int) ($plan->total_revenue ?? 0),
            ])
            ->values()
            ->all();

        // 4. Recent transactions (5 latest payments with user and plan)
        $recentTransactions = Payment::query()
            ->with([
                'user:id,name,email',
                'plan:id,name',
            ])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'merchant_order_id' => $payment->merchant_order_id,
                'user_name' => $payment->user?->name,
                'user_email' => $payment->user?->email,
                'plan_name' => $payment->plan?->name,
                'amount' => (int) $payment->amount,
                'status' => $payment->status instanceof PaymentStatusEnum ? $payment->status->value : (string) $payment->status,
                'paid_at' => $payment->paid_at?->toIso8601String(),
                'created_at' => $payment->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();

        return [
            'status' => 'ok',
            // Preserved legacy fields
            'users_count' => User::count(),
            'roles_count' => Role::count(),
            'permissions_count' => Permission::count(),
            // SaaS core metrics
            'mrr' => $mrr,
            'total_revenue' => $totalRevenue,
            'active_subscriptions_count' => $activeSubscriptionsCount,
            'paid_subscriptions_count' => $paidSubscriptionsCount,
            'trial_subscriptions_count' => $trialSubscriptionsCount,
            'total_users_count' => $totalUsersCount,
            'new_users_this_month' => $newUsersThisMonth,
            'total_theses_count' => $totalThesesCount,
            'active_theses_count' => $activeThesesCount,
            // Chart & breakdowns
            'monthly_data' => $monthlyData,
            'plan_breakdown' => $planBreakdown,
            'recent_transactions' => $recentTransactions,
        ];
    }

    /**
     * @return array<int, array{month: string, revenue: int, new_users: int, paid_conversions: int}>
     */
    private function buildMonthlyChartData(Carbon $startDate, Carbon $endDate): array
    {
        // Pre-populate empty monthly buckets
        $buckets = [];
        $cursor = $startDate->copy()->startOfMonth();
        $endMonth = $endDate->copy()->startOfMonth();

        while ($cursor->lessThanOrEqualTo($endMonth)) {
            $key = $cursor->format('Y-m');
            $buckets[$key] = [
                'month' => $cursor->format('M Y'),
                'revenue' => 0,
                'new_users' => 0,
                'paid_conversions' => 0,
            ];
            $cursor->addMonth();
        }

        // Aggregate successful payments by month
        $payments = Payment::query()
            ->where('status', PaymentStatusEnum::PAID->value)
            ->where(function ($q) use ($startDate) {
                $q->where('paid_at', '>=', $startDate)
                    ->orWhere(function ($q2) use ($startDate) {
                        $q2->whereNull('paid_at')->where('created_at', '>=', $startDate);
                    });
            })
            ->select(['amount', 'paid_at', 'created_at'])
            ->get();

        foreach ($payments as $payment) {
            $date = $payment->paid_at ?? $payment->created_at;
            $key = $date?->format('Y-m');
            if ($key && isset($buckets[$key])) {
                $buckets[$key]['revenue'] += (int) $payment->amount;
            }
        }

        // Aggregate non-admin user registrations by month
        $users = User::query()
            ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'super admin'))
            ->where('created_at', '>=', $startDate)
            ->select(['created_at'])
            ->get();

        foreach ($users as $user) {
            $key = $user->created_at?->format('Y-m');
            if ($key && isset($buckets[$key])) {
                $buckets[$key]['new_users']++;
            }
        }

        // Aggregate new paid subscription conversions by month
        $conversions = Subscription::query()
            ->where('type', SubscriptionTypeEnum::PAID->value)
            ->where('created_at', '>=', $startDate)
            ->select(['created_at'])
            ->get();

        foreach ($conversions as $subscription) {
            $key = $subscription->created_at?->format('Y-m');
            if ($key && isset($buckets[$key])) {
                $buckets[$key]['paid_conversions']++;
            }
        }

        return array_values($buckets);
    }
}
