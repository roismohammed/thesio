<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\ChapterAnnotation;
use App\Models\Thesis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChapterAnnotationController extends Controller
{
    public function index(Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('view', $chapter);

        $annotations = $chapter->annotations()->with('user:id,name,email')->get();

        return response()->json([
            'data' => $annotations->map(fn (ChapterAnnotation $a): array => $this->serialize($a)),
        ]);
    }

    public function store(Request $request, Thesis $thesis, Chapter $chapter): JsonResponse
    {
        $this->authorize('view', $chapter);

        $validated = $request->validate([
            'selected_text' => ['required', 'string', 'max:5000'],
            'color' => ['required', 'string', 'in:yellow,green,blue,pink,orange'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'author_name' => ['nullable', 'string', 'max:100'],
            'author_role' => ['nullable', 'string', 'in:student,lecturer,general'],
            'version_id' => ['nullable', 'integer'],
        ]);

        $user = $request->user();

        $annotation = $chapter->annotations()->create([
            'user_id' => $user->id,
            'version_id' => $validated['version_id'] ?? $chapter->current_version_id,
            'selected_text' => $validated['selected_text'],
            'color' => $validated['color'],
            'comment' => $validated['comment'] ?? null,
            'author_name' => $validated['author_name'] ?? $user->name,
            'author_role' => $validated['author_role'] ?? 'student',
            'is_resolved' => false,
        ]);

        return response()->json([
            'data' => $this->serialize($annotation->load('user:id,name,email')),
        ], 201);
    }

    public function update(Request $request, Thesis $thesis, Chapter $chapter, ChapterAnnotation $annotation): JsonResponse
    {
        $this->authorize('view', $chapter);

        $validated = $request->validate([
            'color' => ['sometimes', 'string', 'in:yellow,green,blue,pink,orange'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'is_resolved' => ['sometimes', 'boolean'],
        ]);

        $annotation->update($validated);

        return response()->json([
            'data' => $this->serialize($annotation->load('user:id,name,email')),
        ]);
    }

    public function destroy(Thesis $thesis, Chapter $chapter, ChapterAnnotation $annotation): JsonResponse
    {
        $this->authorize('view', $chapter);

        $annotation->delete();

        return response()->json(null, 204);
    }

    private function serialize(ChapterAnnotation $a): array
    {
        return [
            'id' => $a->id,
            'chapter_id' => $a->chapter_id,
            'user_id' => $a->user_id,
            'version_id' => $a->version_id,
            'selected_text' => $a->selected_text,
            'color' => $a->color,
            'comment' => $a->comment,
            'author_name' => $a->author_name ?? $a->user?->name,
            'author_role' => $a->author_role,
            'is_resolved' => (bool) $a->is_resolved,
            'created_at' => $a->created_at?->toIso8601String(),
            'updated_at' => $a->updated_at?->toIso8601String(),
        ];
    }
}
