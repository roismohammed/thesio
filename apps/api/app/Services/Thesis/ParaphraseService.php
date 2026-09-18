<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\ApplyParaphraseAction;
use App\Actions\Thesis\CreateParaphraseAction;
use App\Models\Chapter;
use App\Models\ChapterVersion;
use App\Models\Paraphrase;
use Illuminate\Database\Eloquent\Collection;

class ParaphraseService
{
    public function __construct(
        private readonly CreateParaphraseAction $createParaphraseAction,
        private readonly ApplyParaphraseAction $applyParaphraseAction,
    ) {}

    /**
     * Request a paraphrase preview without mutating the chapter text.
     *
     * @param array{
     *   selection: string,
     *   supervision_note_id?: int|null,
     *   custom_instruction?: string|null,
     *   reference_context?: string|null,
     *   style_mode?: string|null
     * } $payload
     * @return array{paraphrase_id: int, original_selection: string, paraphrased_text: string|null, style_mode: string}
     */
    public function preview(Chapter $chapter, int $userId, array $payload): array
    {
        $result = $this->createParaphraseAction->execute($chapter, $userId, $payload);

        $this->logOutcome($chapter, $result['paraphrase']);

        return [
            'paraphrase_id' => $result['paraphrase']->id,
            'original_selection' => $result['original_selection'],
            'paraphrased_text' => $result['paraphrased_text'],
            'style_mode' => $result['style_mode'],
        ];
    }

    /**
     * Get history of paraphrase sessions for a chapter.
     *
     * @return Collection<int, Paraphrase>
     */
    public function history(Chapter $chapter): Collection
    {
        return Paraphrase::query()
            ->where('chapter_id', $chapter->id)
            ->latest('id')
            ->limit(20)
            ->get();
    }

    /**
     * Accept a preview, replacing the selection + snapshotting a new version.
     */
    public function apply(Chapter $chapter, Paraphrase $paraphrase): ChapterVersion
    {
        $version = $this->applyParaphraseAction->execute($chapter, $paraphrase);

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Menerapkan hasil parafrase pada bab '{$chapter->title}' (versi {$version->version_number}).");

        return $version;
    }

    private function logOutcome(Chapter $chapter, Paraphrase $paraphrase): void
    {
        $description = match ($paraphrase->outcome) {
            'failed' => "Permintaan parafrase gagal pada bab '{$chapter->title}'.",
            default => "Membuat pratinjau parafrase asisten pada bab '{$chapter->title}'.",
        };

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log($description);
    }
}

