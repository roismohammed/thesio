<?php

namespace App\Console\Commands;

use App\Models\Thesis;
use App\Services\Thesis\SupervisionGuideService;
use Illuminate\Console\Command;

class GenerateScheduledSupervisionGuides extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'guidance:generate-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate supervision guidance agendas for eligible theses';

    public function __construct(
        private readonly SupervisionGuideService $supervisionGuideService,
    ) {
        parent::__construct();
    }

    /**
     * Loop eligible theses (>=1 chapter, future defense deadline, not
     * tailored) and generate an agenda per thesis. One failure must not
     * abort the batch (FR-016); the guard logic lives in the service.
     */
    public function handle(): int
    {
        $theses = Thesis::query()
            ->withCount('chapters')
            ->get()
            ->filter(fn (Thesis $thesis) => $thesis->chapters_count > 0
                && $thesis->defense_deadline_at !== null
                && $thesis->defense_deadline_at->isFuture());

        $generated = 0;

        foreach ($theses as $thesis) {
            try {
                $guide = $this->supervisionGuideService->generateScheduled($thesis);
                if ($guide !== null) {
                    $generated++;
                }
            } catch (\Throwable $e) {
                $this->warn("Gagal membuat agenda untuk skripsi '{$thesis->title}': {$e->getMessage()}");
            }
        }

        $this->info("Selesai: {$generated} agenda bimbingan dibuat dari {$theses->count()} skripsi yang memenuhi syarat.");

        return self::SUCCESS;
    }
}
