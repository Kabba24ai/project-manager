<?php

namespace App\Http\Controllers\TaskLists;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTaskListRequest;
use App\Http\Resources\TaskListResource;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;

class UpdateController extends Controller
{
    /**
     * Update a task list
     */
    public function __invoke(UpdateTaskListRequest $request, TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        $taskList->update($request->validated());

        return response()->json([
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list updated successfully',
        ]);
    }
}