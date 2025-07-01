<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;

class UpdateController extends Controller
{
    /**
     * Update a task
     */
    public function __invoke(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        // Handle task list change
        if ($request->has('task_list_id') && $request->task_list_id != $task->task_list_id) {
            $newTaskList = TaskList::findOrFail($request->task_list_id);
            
            // Ensure the new task list belongs to the same project
            if ($newTaskList->project_id !== $task->project_id) {
                return response()->json([
                    'message' => 'Task list must belong to the same project',
                ], 422);
            }
        }

        $task->update($request->validated());

        $task->load(['assignedTo', 'taskList']);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task updated successfully',
        ]);
    }
}