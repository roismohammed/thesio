<?php

namespace App\Http\Controllers\Thesis;

use App\Http\Controllers\Controller;
use App\Http\Requests\Thesis\MoveTaskRequest;
use App\Http\Requests\Thesis\StoreTaskRequest;
use App\Http\Requests\Thesis\UpdateTaskRequest;
use App\Http\Resources\Thesis\TaskResource;
use App\Models\Task;
use App\Models\Thesis;
use App\Services\Thesis\TaskCrudService;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function __construct(
        private readonly TaskCrudService $taskCrudService,
    ) {}

    /**
     * List the board's tasks, board-ready (sorted by status, position).
     */
    public function index(Thesis $thesis): JsonResponse
    {
        $this->authorize('view', $thesis);

        $tasks = $thesis->tasks()
            ->orderBy('status')
            ->orderBy('position')
            ->get();

        return TaskResource::collection($tasks)->response();
    }

    /**
     * Create a manual task.
     */
    public function store(StoreTaskRequest $request, Thesis $thesis): JsonResponse
    {
        $this->authorize('update', $thesis);

        $task = $this->taskCrudService->create($thesis, $request->validated());

        return (new TaskResource($task))->response()->setStatusCode(201);
    }

    /**
     * Update a task.
     */
    public function update(UpdateTaskRequest $request, Thesis $thesis, Task $task): JsonResponse
    {
        $this->authorize('update', $thesis);

        $task = $this->taskCrudService->update($thesis, $task, $request->validated());

        return (new TaskResource($task))->response();
    }

    /**
     * Move a task between columns / reorder (DnD drop).
     */
    public function move(MoveTaskRequest $request, Thesis $thesis, Task $task): JsonResponse
    {
        $this->authorize('update', $thesis);

        $task = $this->taskCrudService->move(
            $thesis,
            $task,
            $request->input('status'),
            (int) $request->input('position'),
        );

        return (new TaskResource($task))->response();
    }

    /**
     * Delete a task.
     */
    public function destroy(Thesis $thesis, Task $task): JsonResponse
    {
        $this->authorize('update', $thesis);

        $this->taskCrudService->delete($thesis, $task);

        return response()->json(null, 204);
    }
}