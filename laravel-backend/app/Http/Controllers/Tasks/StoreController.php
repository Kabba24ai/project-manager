<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    /**
     * Create a new task
     */
    public function __invoke(StoreTaskRequest $request, TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        $task = $taskList->tasks()->create([
            ...$request->validated(),
            'project_id' => $taskList->project_id,
            'created_by' => $request->user()->id,
        ]);

        $task->load(['assignedTo', 'taskList']);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task created successfully',
        ], 201);
    }
}