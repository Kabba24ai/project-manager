<?php

namespace App\Http\Controllers\TaskLists;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskListRequest;
use App\Http\Resources\TaskListResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    /**
     * Create a new task list
     */
    public function __invoke(StoreTaskListRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $taskList = $project->taskLists()->create($request->validated());

        $taskList->load(['tasks']);

        return response()->json([
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list created successfully',
        ], 201);
    }
}