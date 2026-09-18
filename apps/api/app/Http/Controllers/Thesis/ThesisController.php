<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\StoreThesisRequest;
use App\Http\Requests\Thesis\UpdateThesisRequest;
use App\Models\Thesis;
use App\Services\Thesis\TaskService;
use App\Services\Thesis\ThesisExportService;
use App\Services\Thesis\ThesisService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ThesisController extends Controller
{
    public function __construct(
        private readonly ThesisService $thesisService,
        private readonly TaskService $taskService,
        private readonly ThesisExportService $exportService,
    ) {}

    /**
     * List the student's theses.
     */
    public function index(): JsonResponse
    {
        $theses = $this->thesisService->list(request()->user()->id);

        return response()->json([
            'data' => $theses->map(fn (Thesis $thesis): array => $this->serialize($thesis)),
        ]);
    }

    /**
     * Create a thesis.
     */
    public function store(StoreThesisRequest $request): JsonResponse
    {
        $thesis = $this->thesisService->create($request->user()->id, $request->validated());

        return response()->json([
            'data' => $this->serialize($thesis),
        ], 201);
    }

    /**
     * Show a thesis with chapters.
     */
    public function show(Thesis $thesis): JsonResponse
    {
        $this->authorize('view', $thesis);

        $thesis = $this->thesisService->show($thesis);

        return response()->json([
            'data' => $this->serialize($thesis, true),
        ]);
    }

    /**
     * Update a thesis.
     */
    public function update(UpdateThesisRequest $request, Thesis $thesis): JsonResponse
    {
        $this->authorize('update', $thesis);

        $thesis = $this->thesisService->update($thesis, $request->validated());

        // When the defense deadline is changed, recompute auto task deadlines
        // (controller orchestration per research D7 — Action stays single-
        // responsibility and does not inject a Service).
        if (array_key_exists('defense_deadline_at', $request->validated())) {
            $this->taskService->recalcDeadlines($thesis);
        }

        return response()->json([
            'data' => $this->serialize($thesis),
        ]);
    }

    /**
     * Delete a thesis (cascades children).
     */
    public function destroy(Thesis $thesis): JsonResponse
    {
        $this->authorize('delete', $thesis);

        $this->thesisService->delete($thesis);

        return response()->json(null, 204);
    }

    /**
     * Export full thesis to compiled DOCX.
     */
    public function exportDocx(Thesis $thesis): StreamedResponse
    {
        $this->authorize('view', $thesis);

        return $this->exportService->exportDocx($thesis);
    }

    /**
     * Export full thesis to compiled printable HTML/PDF.
     */
    public function exportPdf(Thesis $thesis): StreamedResponse
    {
        $this->authorize('view', $thesis);

        return $this->exportService->exportPdf($thesis);
    }

    /**
     * @return array{id: int, title: string, status: string, created_at: string, updated_at: string, chapters_count?: int, chapters?: array<int, array<string, mixed>>}
     */
    private function serialize(Thesis $thesis, bool $withChapters = false): array
    {
        $payload = [
            'id' => $thesis->id,
            'title' => $thesis->title,
            'status' => $thesis->status,
            'defense_deadline_at' => $thesis->defense_deadline_at?->toIso8601String(),
            'guidance_last_viewed_at' => $thesis->guidance_last_viewed_at?->toIso8601String(),
            'created_at' => $thesis->created_at?->toIso8601String(),
            'updated_at' => $thesis->updated_at?->toIso8601String(),
            'chapters_count' => $thesis->chapters_count ?? ($thesis->relationLoaded('chapters') ? $thesis->chapters->count() : $thesis->chapters()->count()),
        ];

        if ($withChapters && $thesis->relationLoaded('chapters')) {
            $payload['chapters'] = $thesis->chapters->map(fn ($chapter) => [
                'id' => $chapter->id,
                'thesis_id' => $chapter->thesis_id,
                'title' => $chapter->title,
                'position' => $chapter->position,
                'status' => $chapter->status,
                'current_version_id' => $chapter->current_version_id,
                'created_at' => $chapter->created_at?->toIso8601String(),
                'updated_at' => $chapter->updated_at?->toIso8601String(),
            ])->all();
        }

        return $payload;
    }
}
