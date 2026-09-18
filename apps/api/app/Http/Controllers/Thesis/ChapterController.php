<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\StoreChapterRequest;
use App\Http\Requests\Thesis\UpdateChapterRequest;
use App\Models\Chapter;
use App\Models\Thesis;
use App\Services\Thesis\ChapterService;
use Illuminate\Http\JsonResponse;

class ChapterController extends Controller
{
    public function __construct(
        private readonly ChapterService $chapterService,
    ) {}

    /**
     * List a thesis's chapters.
     */
    public function index(Thesis $thesis): JsonResponse
    {
        $this->authorize('view', $thesis);

        $chapters = $this->chapterService->list($thesis);

        return response()->json([
            'data' => $chapters->map(fn (Chapter $chapter): array => $this->serialize($chapter)),
        ]);
    }

    /**
     * Create a chapter under a thesis.
     */
    public function store(StoreChapterRequest $request, Thesis $thesis): JsonResponse
    {
        $this->authorize('update', $thesis);

        $chapter = $this->chapterService->create($thesis, $request->validated());

        return response()->json([
            'data' => $this->serialize($chapter),
        ], 201);
    }

    /**
     * Show a chapter with current version + references + note + versions.
     */
    public function show(Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('view', $chapter);

        $chapter = $this->chapterService->show($chapter);

        return response()->json([
            'data' => $this->serialize($chapter, true),
        ]);
    }

    /**
     * Update a chapter.
     */
    public function update(UpdateChapterRequest $request, Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('update', $chapter);

        $chapter = $this->chapterService->update($chapter, $request->validated());

        return response()->json([
            'data' => $this->serialize($chapter),
        ]);
    }

    /**
     * Save updated markdown content as a new chapter version.
     */
    public function saveContent(\Illuminate\Http\Request $request, Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('update', $chapter);

        $request->validate([
            'markdown_content' => ['required', 'string'],
        ]);

        $version = $this->chapterService->saveContent(
            $chapter,
            $request->input('markdown_content'),
            $request->user()->id,
        );

        return response()->json([
            'data' => $this->serializeVersion($version),
        ]);
    }

    /**
     * Delete a chapter (cascades children).
     */
    public function destroy(Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('delete', $chapter);

        $this->chapterService->delete($chapter);

        return response()->json(null, 204);
    }

    /**
     * @return array{id: int, thesis_id: int, title: string, position: int|null, status: string, current_version?: array<string, mixed>|null, references?: array<int, array<string, mixed>>, supervision_note?: array<string, mixed>|null, created_at: string, updated_at: string}
     */
    private function serialize(Chapter $chapter, bool $withDetails = false): array
    {
        $payload = [
            'id' => $chapter->id,
            'thesis_id' => $chapter->thesis_id,
            'title' => $chapter->title,
            'position' => $chapter->position,
            'status' => $chapter->status,
            'current_version_id' => $chapter->current_version_id,
            'created_at' => $chapter->created_at?->toIso8601String(),
            'updated_at' => $chapter->updated_at?->toIso8601String(),
        ];

        if ($withDetails) {
            $payload['current_version'] = $chapter->relationLoaded('currentVersion') && $chapter->currentVersion
                ? $this->serializeVersion($chapter->currentVersion)
                : null;
            $payload['references'] = $chapter->relationLoaded('references')
                ? $chapter->references->map(fn ($ref) => $this->serializeReference($ref))->all()
                : [];
            $payload['supervision_note'] = $chapter->relationLoaded('supervisionNote') && $chapter->supervisionNote
                ? ['id' => $chapter->supervisionNote->id, 'content' => $chapter->supervisionNote->content]
                : null;
        }

        return $payload;
    }

    private function serializeVersion(mixed $version): array
    {
        return [
            'id' => $version->id,
            'version_number' => $version->version_number,
            'source' => $version->source,
            'original_file_name' => $version->original_file_name,
            'mime' => $version->mime,
            'size' => $version->size,
            'conversion_status' => $version->conversion_status,
            'conversion_message' => $version->conversion_message,
            'markdown_content' => $version->markdown_content,
            'created_at' => $version->created_at?->toIso8601String(),
        ];
    }

    private function serializeReference(mixed $ref): array
    {
        return [
            'id' => $ref->id,
            'type' => $ref->type,
            'title' => $ref->title,
            'url' => $ref->url,
            'file_name' => $ref->file_name,
            'mime' => $ref->mime,
            'size' => $ref->size,
            'created_at' => $ref->created_at?->toIso8601String(),
        ];
    }
}
