<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Models\Thesis;
use App\Services\Thesis\DefenseSimulatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DefenseSimulatorController extends Controller
{
    public function __construct(
        protected DefenseSimulatorService $simulatorService
    ) {}

    public function generateQuestions(Thesis $thesis): JsonResponse
    {
        Gate::authorize('view', $thesis);

        $questions = $this->simulatorService->generateQuestions($thesis);

        return response()->json([
            'data' => [
                'questions' => $questions,
            ],
        ]);
    }

    public function evaluateAnswer(Request $request, Thesis $thesis): JsonResponse
    {
        Gate::authorize('view', $thesis);

        $validated = $request->validate([
            'question' => ['required', 'string'],
            'answer' => ['required', 'string', 'min:3'],
        ]);

        $evaluation = $this->simulatorService->evaluateAnswer(
            $validated['question'],
            $validated['answer']
        );

        return response()->json([
            'data' => $evaluation,
        ]);
    }
}
