<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\CreateChapterVersionAction;
use App\Actions\Thesis\RevertChapterVersionAction;
use App\Models\Chapter;
use App\Models\ChapterVersion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChapterVersionService
{
    public function __construct(
        private readonly CreateChapterVersionAction $createChapterVersionAction,
        private readonly RevertChapterVersionAction $revertChapterVersionAction,
    ) {}

    /**
     * Upload a new chapter version (source=upload).
     */
    public function upload(Chapter $chapter, UploadedFile $file, int $userId): ChapterVersion
    {
        $version = $this->createChapterVersionAction->execute($chapter, $file, $userId);

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Mengunggah versi {$version->version_number} bab '{$chapter->title}' (file '{$version->original_file_name}').");

        return $version;
    }

    /**
     * Version history (no markdown content).
     *
     * @return Collection<int, ChapterVersion>
     */
    public function history(Chapter $chapter): Collection
    {
        return $chapter->versions()->get()->makeHidden('markdown_content');
    }

    public function show(ChapterVersion $version): ChapterVersion
    {
        return $version;
    }

    /**
     * Stream the original stored file.
     */
    public function download(ChapterVersion $version): StreamedResponse
    {
        return response()->streamDownload(
            function () use ($version): void {
                echo Storage::disk('local')->get($version->original_file_path);
            },
            $version->original_file_name,
            ['Content-Type' => $version->mime],
        );
    }

    public function revert(Chapter $chapter, ChapterVersion $version): Chapter
    {
        $chapter = $this->revertChapterVersionAction->execute($chapter, $version);

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Mengembalikan bab '{$chapter->title}' ke versi {$version->version_number}.");

        return $chapter;
    }
}
