<?php

namespace App\Actions\Thesis;

use App\Models\Chapter;
use App\Models\ChapterVersion;
use App\Models\Paraphrase;

class ApplyParaphraseAction
{
    /**
     * Accept a paraphrase preview: replace the selection in the current
     * version's Markdown, snapshot a new ChapterVersion (source=paraphrase),
     * mark the Paraphrase applied, and repoint the chapter's current version.
     *
     * @throws \RuntimeException when there is no current version / markdown.
     */
    public function execute(Chapter $chapter, Paraphrase $paraphrase): ChapterVersion
    {
        $current = $chapter->currentVersion;

        if (! $current || $current->markdown_content === null) {
            throw new \RuntimeException('Bab belum memiliki konten yang bisa diubah.');
        }

        $markdown = $current->markdown_content;
        $selection = $paraphrase->original_selection;
        $replacement = $paraphrase->paraphrased_text;

        if ($replacement === null) {
            throw new \RuntimeException('Hasil parafrase tidak tersedia.');
        }

        if (! str_contains($markdown, $selection)) {
            throw new \RuntimeException('Teks asli tidak ditemukan pada konten bab.');
        }

        $updatedMarkdown = str_replace($selection, $replacement, $markdown);

        $nextVersion = $current->version_number + 1;

        $snapshot = ChapterVersion::create([
            'chapter_id' => $chapter->id,
            'version_number' => $nextVersion,
            'source' => 'paraphrase',
            'markdown_content' => $updatedMarkdown,
            'conversion_status' => 'succeeded',
            'uploaded_by' => $paraphrase->user_id,
        ]);

        $chapter->current_version_id = $snapshot->id;
        $chapter->save();

        $paraphrase->update([
            'outcome' => 'applied',
            'applied_at' => now(),
        ]);

        return $snapshot;
    }
}
