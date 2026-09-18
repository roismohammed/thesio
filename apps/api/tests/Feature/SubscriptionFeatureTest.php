<?php

namespace Tests\Feature;

use App\Actions\Payment\ActivatePaidSubscriptionAction;
use App\Actions\Subscription\CreateTrialSubscriptionAction;
use App\Enums\PaymentStatusEnum;
use App\Enums\SubscriptionStatusEnum;
use App\Enums\SubscriptionTypeEnum;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Thesis;
use App\Models\User;
use App\Support\PermissionResolver;
use Carbon\Carbon;
use Database\Seeders\PlanSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->seed(PlanSeeder::class);
    }

    public function test_trial_subscription_created_automatically_on_registration(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Mahasiswa Baru',
            'email' => 'mhs@thesio.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'mhs@thesio.test')->firstOrFail();
        $trial = Subscription::where('user_id', $user->id)->first();

        $this->assertNotNull($trial);
        $this->assertEquals(SubscriptionTypeEnum::TRIAL, $trial->type);
        $this->assertEquals(SubscriptionStatusEnum::ACTIVE, $trial->status);
        $this->assertEquals(120000, $trial->plan->price); // Ultimate plan
        $this->assertTrue(Carbon::parse($trial->ends_at)->isFuture());
    }

    public function test_trial_subscription_is_lifetime_idempotent(): void
    {
        $user = User::factory()->create();
        $action = app(CreateTrialSubscriptionAction::class);

        $trial1 = $action->execute($user);
        $this->assertNotNull($trial1);

        $trial2 = $action->execute($user);
        $this->assertEquals($trial1->id, $trial2->id);
        $this->assertEquals(1, Subscription::where('user_id', $user->id)->count());
    }

    public function test_cannot_subscribe_to_inactive_plan(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');

        $inactivePlan = Plan::create([
            'name' => 'Discontinued Plan',
            'price' => 50000,
            'is_active' => false,
        ]);

        $response = $this->actingAs($user)->postJson('/api/subscriptions', [
            'plan_id' => $inactivePlan->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('plan_id');
    }

    public function test_user_can_have_multiple_paid_subscriptions_and_renew_extends_period(): void
    {
        $user = User::factory()->create();
        $plan = Plan::where('name', 'Pro')->firstOrFail();

        $payment1 = Payment::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'status' => PaymentStatusEnum::PENDING,
            'merchant_order_id' => 'ORDER-001',
        ]);

        $activateAction = app(ActivatePaidSubscriptionAction::class);
        $activateAction->execute('ORDER-001');

        $sub1 = Subscription::where('user_id', $user->id)
            ->where('type', SubscriptionTypeEnum::PAID->value)
            ->firstOrFail();

        $this->assertEquals(SubscriptionStatusEnum::ACTIVE, $sub1->status);
        $firstEndsAt = $sub1->ends_at;

        // Second paid subscription (renewal)
        $payment2 = Payment::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'status' => PaymentStatusEnum::PENDING,
            'merchant_order_id' => 'ORDER-002',
        ]);

        // Should NOT throw Unique constraint violation!
        $activateAction->execute('ORDER-002');

        $paidCount = Subscription::where('user_id', $user->id)
            ->where('type', SubscriptionTypeEnum::PAID->value)
            ->count();

        $this->assertEquals(2, $paidCount);

        $sub2 = Subscription::where('user_id', $user->id)
            ->where('type', SubscriptionTypeEnum::PAID->value)
            ->latest('id')
            ->firstOrFail();

        // Ends at should be extended from firstEndsAt by 30 days
        $this->assertEquals(
            $firstEndsAt->copy()->addDays(30)->format('Y-m-d H:i:s'),
            $sub2->ends_at->format('Y-m-d H:i:s')
        );
    }

    public function test_permission_resolver_returns_active_subscription_permissions(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');

        // Without subscription
        $permissions = PermissionResolver::getActivePermissions($user);
        $this->assertEmpty($permissions);
        $this->assertFalse(PermissionResolver::hasActiveAccess($user, 'access thesis'));

        // Assign Starter plan (only 'access thesis')
        $starterPlan = Plan::where('name', 'Starter')->firstOrFail();
        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $starterPlan->id,
            'type' => SubscriptionTypeEnum::PAID,
            'status' => SubscriptionStatusEnum::ACTIVE,
            'starts_at' => Carbon::now()->subDay(),
            'ends_at' => Carbon::now()->addDays(29),
        ]);

        $this->assertTrue(PermissionResolver::hasActiveAccess($user, 'access thesis'));
        $this->assertFalse(PermissionResolver::hasActiveAccess($user, 'access supervision'));
        $this->assertFalse(PermissionResolver::hasActiveAccess($user, 'access kanban'));
        $this->assertFalse(PermissionResolver::hasActiveAccess($user, 'access academic tools'));
    }

    public function test_thesis_routes_are_guarded_by_subscription_permission(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');

        // 1. Without any subscription -> blocked with 403
        $response = $this->actingAs($user)->getJson('/api/thesis');
        $response->assertStatus(403);
        $response->assertJson([
            'code' => 'SUBSCRIPTION_PERMISSION_REQUIRED',
        ]);

        // 2. Give Starter plan -> thesis index allowed, but supervision blocked
        $starterPlan = Plan::where('name', 'Starter')->firstOrFail();
        $starterSub = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $starterPlan->id,
            'type' => SubscriptionTypeEnum::PAID,
            'status' => SubscriptionStatusEnum::ACTIVE,
            'starts_at' => Carbon::now()->subDay(),
            'ends_at' => Carbon::now()->addDays(29),
        ]);

        $responseThesis = $this->actingAs($user)->getJson('/api/thesis');
        $responseThesis->assertStatus(200);

        $thesis = Thesis::create([
            'user_id' => $user->id,
            'title' => 'Skripsi Uji',
            'status' => 'in_progress',
        ]);

        // Supervision route blocked for Starter plan
        $responseSupervision = $this->actingAs($user)->getJson("/api/thesis/{$thesis->id}/supervision-guides/current");
        $responseSupervision->assertStatus(403);
    }

    public function test_expired_subscription_blocks_access(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');

        $ultimatePlan = Plan::where('name', 'Ultimate')->firstOrFail();
        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $ultimatePlan->id,
            'type' => SubscriptionTypeEnum::PAID,
            'status' => SubscriptionStatusEnum::ACTIVE,
            'starts_at' => Carbon::now()->subDays(31),
            'ends_at' => Carbon::now()->subDay(), // Expired
        ]);

        $response = $this->actingAs($user)->getJson('/api/thesis');
        $response->assertStatus(403);
        $response->assertJson([
            'code' => 'SUBSCRIPTION_PERMISSION_REQUIRED',
        ]);
    }

    public function test_user_can_mock_pay_pending_payment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');
        $plan = Plan::where('name', 'Ultimate')->firstOrFail();

        $payment = Payment::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'status' => PaymentStatusEnum::PENDING,
            'merchant_order_id' => 'ORDER-MOCK-001',
        ]);

        $response = $this->actingAs($user)->postJson("/api/payments/{$payment->id}/mock-pay");

        $response->assertStatus(200);
        $this->assertEquals(PaymentStatusEnum::PAID, $payment->fresh()->status);

        $subscription = Subscription::where('user_id', $user->id)
            ->where('type', SubscriptionTypeEnum::PAID->value)
            ->where('status', SubscriptionStatusEnum::ACTIVE->value)
            ->first();

        $this->assertNotNull($subscription);
    }

    public function test_user_cannot_mock_pay_other_users_payment(): void
    {
        $user1 = User::factory()->create();
        $user1->assignRole('user');

        $user2 = User::factory()->create();
        $user2->assignRole('user');

        $plan = Plan::where('name', 'Starter')->firstOrFail();

        $payment = Payment::create([
            'user_id' => $user1->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'status' => PaymentStatusEnum::PENDING,
            'merchant_order_id' => 'ORDER-MOCK-002',
        ]);

        $response = $this->actingAs($user2)->postJson("/api/payments/{$payment->id}/mock-pay");
        $response->assertStatus(403);
    }

    public function test_user_cannot_mock_pay_non_pending_payment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');
        $plan = Plan::where('name', 'Starter')->firstOrFail();

        $payment = Payment::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'status' => PaymentStatusEnum::PAID,
            'merchant_order_id' => 'ORDER-MOCK-003',
        ]);

        $response = $this->actingAs($user)->postJson("/api/payments/{$payment->id}/mock-pay");
        $response->assertStatus(422);
    }

    public function test_mock_pay_blocked_when_midtrans_is_production(): void
    {
        config(['midtrans.is_production' => true]);

        $user = User::factory()->create();
        $user->assignRole('user');
        $plan = Plan::where('name', 'Starter')->firstOrFail();

        $payment = Payment::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'amount' => $plan->price,
            'status' => PaymentStatusEnum::PENDING,
            'merchant_order_id' => 'ORDER-MOCK-004',
        ]);

        $response = $this->actingAs($user)->postJson("/api/payments/{$payment->id}/mock-pay");
        $response->assertStatus(403);
    }
}
