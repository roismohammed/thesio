<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\StoreReferenceRequest;
use App\Http\Requests\Thesis\UpdateReferenceRequest;
use App\Models\Chapter;
use App\Models\Reference;
use App\Models\Thesis;
use App\Services\Thesis\ReferenceService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReferenceController extends Controller
{
    public function __construct(
        private readonly ReferenceService $referenceService,
    ) {}

    /**
     * List a chapter's references.
     */
    public function index(Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('view', $chapter);

        $references = $this->referenceService->list($chapter);

        return response()->json([
            'data' => $references->map(fn (Reference $reference): array => $this->serialize($reference))->all(),
        ]);
    }

    /**
     * Create a link- or file-type reference.
     */
    public function store(StoreReferenceRequest $request, Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('update', $chapter);

        $reference = $this->referenceService->create(
            $chapter,
            $request->validated(),
            $request->file('file'),
        );

        return response()->json([
            'data' => $this->serialize($reference),
        ], 201);
    }

    /**
     * Update a reference (title/url).
     */
    public function update(UpdateReferenceRequest $request, Thesis $thesis, Chapter $chapter, Reference $reference): JsonResponse
    {
        $this->authorize('update', $chapter);

        $reference = $this->referenceService->update($reference, $request->validated());

        return response()->json([
            'data' => $this->serialize($reference),
        ]);
    }

    /**
     * Delete a reference.
     */
    public function destroy(Thesis $thesis, Chapter $chapter, Reference $reference): JsonResponse
    {
        $this->authorize('update', $chapter);

        $this->referenceService->delete($reference);

        return response()->json(null, 204);
    }

    /**
     * Download a file-type reference's stored file.
     */
    public function download(Thesis $thesis, Chapter $chapter, Reference $reference): StreamedResponse
    {
        $this->authorize('view', $chapter);

        return $this->referenceService->download($reference);
    }

    private function serialize(Reference $reference): array
    {
        return [
            'id' => $reference->id,
            'chapter_id' => $reference->chapter_id,
            'type' => $reference->type,
            'title' => $reference->title,
            'authors' => $reference->authors,
            'year' => $reference->year,
            'publication' => $reference->publication,
            'volume' => $reference->volume,
            'pages' => $reference->pages,
            'doi' => $reference->doi,
            'url' => $reference->url,
            'file_name' => $reference->file_name,
            'mime' => $reference->mime,
            'size' => $reference->size,
            'created_at' => $reference->created_at?->toIso8601String(),
            'updated_at' => $reference->updated_at?->toIso8601String(),
        ];
    }
}
