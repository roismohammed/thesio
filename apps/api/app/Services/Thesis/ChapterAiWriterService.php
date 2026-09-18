<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\GenerateChapterDraftAction;
use App\Models\Chapter;

class ChapterAiWriterService
{
    public function __construct(
        private readonly GenerateChapterDraftAction $generateChapterDraftAction,
    ) {}

    /**
     * @param array{
     *   instruction: string,
     *   section_title?: string|null,
     *   reference_ids?: array<int>|null,
     *   current_content?: string|null,
     *   writing_tone?: string|null,
     *   target_length?: string|null
     * } $payload
     * @return array{content: string, references_used: array<int, string>}
     */
    public function write(Chapter $chapter, array $payload): array
    {
        $result = $this->generateChapterDraftAction->execute($chapter, $payload);

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Menggunakan AI Co-Writer untuk menyusun draf pada bab '{$chapter->title}'.");

        return $result;
    }
}
