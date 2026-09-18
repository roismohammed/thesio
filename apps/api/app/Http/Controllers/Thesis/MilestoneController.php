<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Models\Milestone;
use App\Models\Thesis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    /**
     * List all milestones of a thesis. If none exist, auto-seed default stages.
     */
    public function index(Thesis $thesis): JsonResponse
    {
        $this->authorize('view', $thesis);

        if ($thesis->milestones()->count() === 0) {
            $defaultStages = [
                ['name' => 'Seminar Proposal (Sempro)', 'position' => 1],
                ['name' => 'Pengambilan Data & Penelitian', 'position' => 2],
                ['name' => 'Seminar Hasil (Semhas)', 'position' => 3],
                ['name' => 'Sidang Meja Hijau / Skripsi', 'position' => 4],
            ];
            foreach ($defaultStages as $stage) {
                $thesis->milestones()->create([
                    'name' => $stage['name'],
                    'position' => $stage['position'],
                    'status' => 'pending',
                ]);
            }
        }

        $milestones = $thesis->milestones()->orderBy('position')->get();

        return response()->json([
            'data' => $milestones->map(fn (Milestone $m) => [
                'id' => $m->id,
                'thesis_id' => $m->thesis_id,
                'name' => $m->name,
                'target_date' => $m->target_date?->toDateString(),
                'completed_date' => $m->completed_date?->toDateString(),
                'status' => $m->status,
                'position' => $m->position,
                'created_at' => $m->created_at?->toIso8601String(),
                'updated_at' => $m->updated_at?->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Create a new milestone.
     */
    public function store(Request $request, Thesis $thesis): JsonResponse
    {
        $this->authorize('update', $thesis);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'target_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', 'in:pending,in_progress,completed'],
            'position' => ['nullable', 'integer'],
        ]);

        $maxPos = $thesis->milestones()->max('position') ?? 0;
        $milestone = $thesis->milestones()->create([
            'name' => $validated['name'],
            'target_date' => $validated['target_date'] ?? null,
            'status' => $validated['status'] ?? 'pending',
            'position' => $validated['position'] ?? ($maxPos + 1),
        ]);

        return response()->json([
            'data' => $milestone,
        ], 201);
    }

    /**
     * Update a milestone.
     */
    public function update(Request $request, Thesis $thesis, Milestone $milestone): JsonResponse
    {
        $this->authorize('update', $thesis);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'target_date' => ['sometimes', 'nullable', 'date'],
            'completed_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'string', 'in:pending,in_progress,completed'],
            'position' => ['sometimes', 'integer'],
        ]);

        if (isset($validated['status']) && $validated['status'] === 'completed' && empty($milestone->completed_date)) {
            $validated['completed_date'] = now()->toDateString();
        }

        $milestone->update($validated);

        return response()->json([
            'data' => $milestone,
        ]);
    }

    /**
     * Delete a milestone.
     */
    public function destroy(Thesis $thesis, Milestone $milestone): JsonResponse
    {
        $this->authorize('update', $thesis);

        $milestone->delete();

        return response()->json(null, 204);
    }
}
