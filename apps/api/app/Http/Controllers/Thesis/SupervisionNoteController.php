<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\UpsertSupervisionNoteRequest;
use App\Models\Chapter;
use App\Models\Thesis;
use App\Services\Thesis\SupervisionNoteService;
use Illuminate\Http\JsonResponse;

class SupervisionNoteController extends Controller
{
    public function __construct(
        private readonly SupervisionNoteService $supervisionNoteService,
    ) {}

    /**
     * Show the chapter's note; `data` is null when none exists yet (a valid
     * initial state, not an error).
     */
    public function show(Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('view', $chapter);

        $note = $this->supervisionNoteService->show($chapter);

        return response()->json([
            'data' => $note ? $this->serialize($note) : null,
        ]);
    }

    /**
     * Create-or-update the chapter's note.
     */
    public function upsert(UpsertSupervisionNoteRequest $request, Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('update', $chapter);

        $note = $this->supervisionNoteService->upsert($chapter, $request->validated()['content']);

        return response()->json([
            'data' => $this->serialize($note),
        ]);
    }

    /**
     * Delete the chapter's note.
     */
    public function destroy(Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('update', $chapter);

        $this->supervisionNoteService->delete($chapter);

        return response()->json(null, 204);
    }

    private function serialize(mixed $note): array
    {
        return [
            'id' => $note->id,
            'chapter_id' => $note->chapter_id,
            'content' => $note->content,
            'created_at' => $note->created_at?->toIso8601String(),
            'updated_at' => $note->updated_at?->toIso8601String(),
        ];
    }
}
