<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\GenerateTaskSuggestionsRequest;
use App\Http\Resources\Thesis\TaskResource;
use App\Http\Resources\Thesis\TaskSuggestionResource;
use App\Models\TaskSuggestion;
use App\Models\Thesis;
use App\Services\Thesis\TaskSuggestionService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class TaskSuggestionController extends Controller
{
    public function __construct(
        private readonly TaskSuggestionService $taskSuggestionService,
    ) {}

    /**
     * Generate AI suggestions on demand (idempotent unless `force`).
     */
    public function generate(GenerateTaskSuggestionsRequest $request, Thesis $thesis): JsonResponse
    {
        $this->authorize('view', $thesis);

        try {
            $suggestions = $this->taskSuggestionService->generate($thesis, (bool) $request->input('force', false));
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage() === TaskSuggestionService::NO_ELIGIBLE_SOURCE_MESSAGE
                    ? TaskSuggestionService::NO_ELIGIBLE_SOURCE_MESSAGE
                    : 'Gagal membuat saran tugas. Silakan coba lagi.',
            ], 422);
        }

        return TaskSuggestionResource::collection($suggestions)->response()->setStatusCode(201);
    }

    /**
     * List active (pending) suggestions sorted by priority.
     */
    public function index(Thesis $thesis): JsonResponse
    {
        $this->authorize('view', $thesis);

        $suggestions = $this->taskSuggestionService->listPending($thesis);

        return TaskSuggestionResource::collection($suggestions)->response();
    }

    /**
     * Accept a suggestion — becomes a task.
     */
    public function accept(Thesis $thesis, TaskSuggestion $suggestion): JsonResponse
    {
        $this->authorize('update', $thesis);

        $task = $this->taskSuggestionService->accept($thesis, $suggestion);

        return (new TaskResource($task))->response()->setStatusCode(201);
    }

    /**
     * Reject a suggestion — hidden from the active list, kept for dedup.
     */
    public function reject(Thesis $thesis, TaskSuggestion $suggestion): JsonResponse
    {
        $this->authorize('update', $thesis);

        $this->taskSuggestionService->reject($thesis, $suggestion);

        return response()->json(null, 204);
    }
}