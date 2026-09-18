<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\CreateChapterAction;
use App\Actions\Thesis\DeleteChapterAction;
use App\Actions\Thesis\SaveChapterContentAction;
use App\Actions\Thesis\UpdateChapterAction;
use App\Models\Chapter;
use App\Models\ChapterVersion;
use App\Models\Thesis;
use Illuminate\Support\Collection;

class ChapterService
{
    public function __construct(
        private readonly CreateChapterAction $createChapterAction,
        private readonly UpdateChapterAction $updateChapterAction,
        private readonly DeleteChapterAction $deleteChapterAction,
        private readonly SaveChapterContentAction $saveChapterContentAction,
    ) {}

    /**
     * List a thesis's chapters.
     *
     * @return Collection<int, Chapter>
     */
    public function list(Thesis $thesis): Collection
    {
        return $thesis->chapters()->with('currentVersion')->get();
    }

    /**
     * Show a chapter with its current version (incl. markdown), references,
     * supervision note, and a versions summary.
     */
    public function show(Chapter $chapter): Chapter
    {
        return $chapter->load([
            'currentVersion',
            'references',
            'supervisionNote',
        ]);
    }

    /**
     * @param  array{title: string, position?: int}  $data
     */
    public function create(Thesis $thesis, array $data): Chapter
    {
        $chapter = $this->createChapterAction->execute($thesis->id, $data);

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Menambahkan bab '{$chapter->title}' pada skripsi '{$thesis->title}'.");

        return $chapter;
    }

    /**
     * @param  array{title?: string, position?: int|null, status?: string}  $data
     */
    public function update(Chapter $chapter, array $data): Chapter
    {
        $oldTitle = $chapter->title;
        $chapter = $this->updateChapterAction->execute($chapter, $data);

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Memperbarui bab '{$oldTitle}' menjadi '{$chapter->title}'.");

        return $chapter;
    }

    /**
     * Save edited markdown content as a new chapter version.
     */
    public function saveContent(Chapter $chapter, string $markdownContent, int $userId): ChapterVersion
    {
        $version = $this->saveChapterContentAction->execute($chapter, $markdownContent, $userId);

        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Menyimpan revisi konten teks bab '{$chapter->title}' (versi {$version->version_number}).");

        return $version;
    }

    public function delete(Chapter $chapter): void
    {
        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Menghapus bab '{$chapter->title}'.");

        $this->deleteChapterAction->execute($chapter);
    }
}

