<?php

namespace App\Actions\Thesis;

use App\Jobs\Thesis\ConvertChapterToMarkdownJob;
use App\Models\Chapter;
use App\Models\ChapterVersion;
use App\Support\MarkdownConverter;
use Illuminate\Http\UploadedFile;
use Throwable;

class CreateChapterVersionAction
{
    public function __construct(
        private readonly MarkdownConverter $markdownConverter,
    ) {}

    /**
     * Store an uploaded chapter document, create a version, point the
     * chapter's current version at it, convert immediately (sync) or fallback to queue.
     */
    public function execute(Chapter $chapter, UploadedFile $file, int $userId): ChapterVersion
    {
        $versionNumber = ($chapter->versions()->max('version_number') ?? 0) + 1;

        $path = $file->store('thesis/chapters/'.$chapter->id, 'local');

        $version = ChapterVersion::create([
            'chapter_id' => $chapter->id,
            'version_number' => $versionNumber,
            'source' => 'upload',
            'original_file_path' => $path,
            'original_file_name' => $file->getClientOriginalName(),
            'mime' => $file->getMimeType(),
            'size' => $file->getSize(),
            'conversion_status' => 'pending',
            'uploaded_by' => $userId,
        ]);

        $chapter->current_version_id = $version->id;
        $chapter->save();

        // Attempt immediate synchronous conversion
        $result = $this->markdownConverter->convert($version->original_file_path, $version->mime);
        $version->markdown_content = $result['markdown'];
        $version->conversion_status = $result['status'];
        $version->conversion_message = $result['message'];
        $version->save();

        if ($version->conversion_status === 'pending') {
            ConvertChapterToMarkdownJob::dispatch($version);
        }

        return $version;
    }
}

