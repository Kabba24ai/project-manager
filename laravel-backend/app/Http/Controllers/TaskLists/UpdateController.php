<?php

namespace App\Http\Controllers\TaskLists;

use App\Http\Controllers\Controller as BaseController;
use App\Http\Requests\UpdateTaskListRequest;
use App\Http\Resources\TaskListResource;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;

class UpdateController extends BaseController
{
    /**
     * Update a task list (Laravel 12 compatible)
     */
    public function __invoke(UpdateTaskListRequest $request, TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        $taskList->update($request->validated());

        $taskList->load(['tasks']);

        return response()->json([
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list updated successfully',
        ]);
    }
}