<?php

namespace App\Actions\Thesis;

use App\Models\Chapter;
use App\Models\ChapterVersion;

class SaveChapterContentAction
{
    /**
     * Save updated markdown content as a new chapter version.
     */
    public function execute(Chapter $chapter, string $markdownContent, int $userId): ChapterVersion
    {
        $versionNumber = ($chapter->versions()->max('version_number') ?? 0) + 1;

        $version = ChapterVersion::create([
            'chapter_id' => $chapter->id,
            'version_number' => $versionNumber,
            'source' => 'manual_edit',
            'original_file_path' => null,
            'original_file_name' => "Edit Versi {$versionNumber}.md",
            'mime' => 'text/markdown',
            'size' => strlen($markdownContent),
            'markdown_content' => $markdownContent,
            'conversion_status' => 'succeeded',
            'conversion_message' => null,
            'uploaded_by' => $userId,
        ]);

        $chapter->current_version_id = $version->id;
        $chapter->save();

        return $version;
    }
}
