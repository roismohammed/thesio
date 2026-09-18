<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\AddGuidancePointAction;
use App\Actions\Thesis\CreateSupervisionGuideAction;
use App\Actions\Thesis\DeleteGuidancePointAction;
use App\Actions\Thesis\UpdateGuidancePointAction;
use App\Models\GuidancePoint;
use App\Models\SupervisionGuide;
use App\Models\Thesis;
use Illuminate\Support\Collection;
use RuntimeException;

class SupervisionGuideService
{
    /**
     * Message used when generation is blocked for a thesis with no chapters.
     */
    public const NO_CHAPTERS_MESSAGE = 'Buat dan unggah minimal satu bab sebelum membuat agenda bimbingan.';

    public function __construct(
        private readonly CreateSupervisionGuideAction $createSupervisionGuideAction,
        private readonly AddGuidancePointAction $addGuidancePointAction,
        private readonly UpdateGuidancePointAction $updateGuidancePointAction,
        private readonly DeleteGuidancePointAction $deleteGuidancePointAction,
    ) {}

    /**
     * Generate an agenda on demand. Guard: at least one chapter required.
     */
    public function generateOnDemand(Thesis $thesis): SupervisionGuide
    {
        if ($thesis->chapters->count() === 0) {
            throw new RuntimeException(self::NO_CHAPTERS_MESSAGE);
        }

        $thesis->load(['chapters.currentVersion', 'chapters.supervisionNote']);

        $guide = $this->createSupervisionGuideAction->execute(
            $thesis,
            'on_demand',
            $this->previousOpenPoints($thesis),
        );

        activity('thesis')
            ->performedOn($thesis)
            ->causedBy(request()->user())
            ->log("Membuat agenda bimbingan atas permintaan untuk skripsi '{$thesis->title}' — {$guide->points()->count()} poin diskusi.");

        return $guide;
    }

    /**
     * Generate an agenda during a scheduled run. Guards: at least one chapter,
     * a future defense deadline, and the current guide not being tailored.
     * Failures are logged and skipped; the prior current guide stays.
     */
    public function generateScheduled(Thesis $thesis): ?SupervisionGuide
    {
        if ($thesis->chapters()->count() === 0) {
            return null;
        }

        if ($thesis->defense_deadline_at === null || $thesis->defense_deadline_at->isPast()) {
            activity('thesis')
                ->performedOn($thesis)
                ->log("Deadline sidang untuk skripsi '{$thesis->title}' telah terlewati. Agenda otomatis dilewati.");

            return null;
        }

        $current = $thesis->supervisionGuides()->where('status', 'current')->first();
        if ($current !== null && $current->is_tailored) {
            activity('thesis')
                ->performedOn($thesis)
                ->log("Agenda bimbingan untuk skripsi '{$thesis->title}' dilewati karena sedang disesuaikan.");

            return null;
        }

        $thesis->load(['chapters.currentVersion', 'chapters.supervisionNote']);

        try {
            $guide = $this->createSupervisionGuideAction->execute(
                $thesis,
                'scheduled',
                $this->previousOpenPoints($thesis),
            );

            activity('thesis')
                ->performedOn($thesis)
                ->causedBy(request()->user())
                ->log("Membuat agenda bimbingan otomatis untuk skripsi '{$thesis->title}' — {$guide->points()->count()} poin diskusi, deadline sidang {$thesis->defense_deadline_at->toDateString()}.");

            return $guide;
        } catch (RuntimeException $e) {
            activity('thesis')
                ->performedOn($thesis)
                ->log("Gagal membuat agenda bimbingan untuk skripsi '{$thesis->title}'. Agenda sebelumnya tetap digunakan.");

            return null;
        }
    }

    /**
     * The current guide for a thesis, if any.
     */
    public function getCurrent(Thesis $thesis): ?SupervisionGuide
    {
        return $thesis->supervisionGuides()
            ->with(['points', 'thesis'])
            ->where('status', 'current')
            ->first();
    }

    /**
     * Mark the thesis guidance as viewed (clears the unread indicator).
     */
    public function markViewed(Thesis $thesis): void
    {
        $thesis->forceFill(['guidance_last_viewed_at' => now()])->save();
    }

    /**
     * Add a custom (student) point to a guide.
     *
     * @param  array{title: string, description?: string|null, chapter_id?: int|null, supervision_note_id?: int|null}  $data
     */
    public function addPoint(SupervisionGuide $guide, array $data): GuidancePoint
    {
        $point = $this->addGuidancePointAction->execute($guide, $data);

        activity('thesis')
            ->performedOn($guide)
            ->causedBy(request()->user())
            ->log("Menambahkan poin bimbingan '{$point->title}' pada agenda skripsi '{$guide->thesis->title}'.");

        return $point;
    }

    /**
     * Update a point (status; title/description only for student points).
     *
     * @param  array{status?: string, title?: string, description?: string}  $data
     */
    public function updatePoint(SupervisionGuide $guide, GuidancePoint $point, array $data): GuidancePoint
    {
        $wasPrepared = $point->status === 'prepared';
        $point = $this->updateGuidancePointAction->execute($guide, $point, $data);

        if (! $wasPrepared && $point->status === 'prepared') {
            activity('thesis')
                ->performedOn($guide)
                ->causedBy(request()->user())
                ->log("Menandai poin bimbingan '{$point->title}' sebagai siap dibawa ke dosen.");
        } else {
            activity('thesis')
                ->performedOn($guide)
                ->causedBy(request()->user())
                ->log("Memperbarui poin bimbingan '{$point->title}'.");
        }

        return $point;
    }

    /**
     * Remove a point from a guide.
     */
    public function deletePoint(SupervisionGuide $guide, GuidancePoint $point): void
    {
        activity('thesis')
            ->performedOn($guide)
            ->causedBy(request()->user())
            ->log("Menghapus poin bimbingan '{$point->title}' dari agenda.");

        $this->deleteGuidancePointAction->execute($guide, $point);
    }

    /**
     * Points from prior guides that were never marked prepared — used as
     * cross-session continuity context for the next generation.
     *
     * @return Collection<int, GuidancePoint>
     */
    public function previousOpenPoints(Thesis $thesis): Collection
    {
        return SupervisionGuide::with('points')
            ->where('thesis_id', $thesis->id)
            ->where('status', 'archived')
            ->get()
            ->flatMap(fn (SupervisionGuide $guide) => $guide->points)
            ->filter(fn (GuidancePoint $point) => $point->status === 'pending')
            ->values();
    }
}
