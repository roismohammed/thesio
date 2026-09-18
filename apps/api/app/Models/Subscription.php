<?php

namespace App\Models;

use App\Enums\SubscriptionStatusEnum;
use App\Enums\SubscriptionTypeEnum;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'type',
        'status',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => SubscriptionTypeEnum::class,
            'status' => SubscriptionStatusEnum::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function isActive(): bool
    {
        $now = Carbon::now();

        return $this->status === SubscriptionStatusEnum::ACTIVE
            && $this->starts_at <= $now
            && $this->ends_at >= $now;
    }

    public function isExpired(): bool
    {
        return $this->ends_at < Carbon::now();
    }
}
