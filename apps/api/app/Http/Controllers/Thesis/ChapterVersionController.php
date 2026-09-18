<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\StoreChapterVersionRequest;
use App\Models\Chapter;
use App\Models\ChapterVersion;
use App\Models\Thesis;
use App\Services\Thesis\ChapterVersionService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChapterVersionController extends Controller
{
    public function __construct(
        private readonly ChapterVersionService $chapterVersionService,
    ) {}

    /**
     * Upload a new version of the chapter.
     */
    public function store(StoreChapterVersionRequest $request, Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('update', $chapter);

        $version = $this->chapterVersionService->upload(
            $chapter,
            $request->file('file'),
            $request->user()->id,
        );

        return response()->json([
            'data' => $this->serialize($version),
        ], 201);
    }

    /**
     * Version history (no markdown content).
     */
    public function index(Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('view', $chapter);

        $versions = $this->chapterVersionService->history($chapter);

        return response()->json([
            'data' => $versions->map(fn (ChapterVersion $version): array => $this->serialize($version, false))->all(),
        ]);
    }

    /**
     * A single version including markdown content.
     */
    public function show(Thesis $thesis, Chapter $chapter, ChapterVersion $version): JsonResponse
    {
        $this->authorize('view', $chapter);

        return response()->json([
            'data' => $this->serialize($version),
        ]);
    }

    /**
     * Stream the original stored file.
     */
    public function download(Thesis $thesis, Chapter $chapter, ChapterVersion $version): StreamedResponse
    {
        $this->authorize('view', $chapter);

        return $this->chapterVersionService->download($version);
    }

    /**
     * Point the chapter's current version at an earlier version.
     */
    public function revert(Thesis $thesis, Chapter $chapter, ChapterVersion $version): JsonResponse
    {
        $this->authorize('update', $chapter);

        $chapter = $this->chapterVersionService->revert($chapter, $version);

        return response()->json([
            'data' => [
                'id' => $chapter->id,
                'current_version_id' => $chapter->current_version_id,
            ],
        ]);
    }

    private function serialize(ChapterVersion $version, bool $withMarkdown = true): array
    {
        return [
            'id' => $version->id,
            'chapter_id' => $version->chapter_id,
            'version_number' => $version->version_number,
            'source' => $version->source,
            'original_file_name' => $version->original_file_name,
            'mime' => $version->mime,
            'size' => $version->size,
            'conversion_status' => $version->conversion_status,
            'conversion_message' => $version->conversion_message,
            'markdown_content' => $withMarkdown ? $version->markdown_content : null,
            'uploaded_by' => $version->uploaded_by,
            'created_at' => $version->created_at?->toIso8601String(),
        ];
    }
}
