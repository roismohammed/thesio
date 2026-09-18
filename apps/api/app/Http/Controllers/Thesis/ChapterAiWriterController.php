<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\AiWriteChapterRequest;
use App\Models\Chapter;
use App\Models\Thesis;
use App\Services\Thesis\ChapterAiWriterService;
use Illuminate\Http\JsonResponse;

class ChapterAiWriterController extends Controller
{
    public function __construct(
        private readonly ChapterAiWriterService $service,
    ) {}

    public function generate(AiWriteChapterRequest $request, Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('update', $chapter);

        $result = $this->service->write($chapter, $request->validated());

        return response()->json([
            'data' => $result,
        ]);
    }
}
