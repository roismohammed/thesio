<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\ParaphraseRequest;
use App\Models\Chapter;
use App\Models\Paraphrase;
use App\Models\Thesis;
use App\Services\Thesis\ParaphraseService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class ParaphraseController extends Controller
{
    public function __construct(
        private readonly ParaphraseService $paraphraseService,
    ) {}

    /**
     * Get history of paraphrase sessions on this chapter.
     */
    public function index(Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('view', $chapter);

        $history = $this->paraphraseService->history($chapter);

        return response()->json([
            'data' => $history,
        ]);
    }

    /**
     * Request a paraphrase preview. Returns 422 with a friendly message when
     * the LLM fails; the chapter text is never altered.
     */
    public function store(ParaphraseRequest $request, Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('update', $chapter);

        $result = $this->paraphraseService->preview(
            $chapter,
            $request->user()->id,
            $request->validated(),
        );

        if ($result['paraphrased_text'] === null) {
            return response()->json([
                'message' => 'Parafrase gagal diproses. Silakan coba lagi.',
            ], 422);
        }

        return response()->json([
            'data' => $result,
        ]);
    }

    /**
     * Accept the preview and apply it to the chapter's current version.
     */
    public function apply(Thesis $thesis, Chapter $chapter, Paraphrase $paraphrase): JsonResponse
    {
        $this->authorize('update', $chapter);

        try {
            $version = $this->paraphraseService->apply($chapter, $paraphrase);

            return response()->json([
                'data' => [
                    'id' => $version->id,
                    'version_number' => $version->version_number,
                    'source' => $version->source,
                    'conversion_status' => $version->conversion_status,
                ],
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}

