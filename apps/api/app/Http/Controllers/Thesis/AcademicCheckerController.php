<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Thesis;
use App\Services\Thesis\AcademicCheckerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicCheckerController extends Controller
{
    public function __construct(
        private readonly AcademicCheckerService $checkerService,
    ) {}

    /**
     * Analyze text from a chapter for Indonesian grammar & academic tone.
     */
    public function analyze(Request $request, Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('view', $chapter);

        $text = $request->input('text') ?? $chapter->currentVersion?->markdown_content ?? '';

        $result = $this->checkerService->analyze((string) $text);

        return response()->json([
            'data' => $result,
        ]);
    }
}
