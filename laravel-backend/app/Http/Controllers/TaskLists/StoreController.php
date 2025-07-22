<?php

namespace App\Http\Controllers\TaskLists;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskListRequest;
use App\Http\Resources\TaskListResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class StoreController extends Controller
{
    /**
     * Create a new task list (Laravel 12 compatible)
     */
    public function __invoke(StoreTaskListRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        // Auto-assign order if not provided
        $order = $request->order ?? ($project->taskLists()->max('order') + 1);

        $taskList = $project->taskLists()->create([
            ...$request->validated(),
            'order' => $order,
        ]);

        $taskList->load(['tasks']);

        return response()->json([
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list created successfully',
        ], Response::HTTP_CREATED);
    }
}