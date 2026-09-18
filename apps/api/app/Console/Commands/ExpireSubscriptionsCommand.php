<?php

namespace App\Console\Commands;

use App\Enums\SubscriptionStatusEnum;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ExpireSubscriptionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark past subscriptions as expired';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = Subscription::query()
            ->where('status', SubscriptionStatusEnum::ACTIVE->value)
            ->where('ends_at', '<', Carbon::now())
            ->update(['status' => SubscriptionStatusEnum::EXPIRED->value]);

        $this->info("Berhasil memperbarui {$count} langganan menjadi kedaluwarsa.");

        return Command::SUCCESS;
    }
}
