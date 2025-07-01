<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MoveController extends Controller
{
    /**
     * Move task to different task list
     */
    public function __invoke(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $request->validate([
            'task_list_id' => 'required|exists:task_lists,id',
        ]);

        $newTaskList = TaskList::findOrFail($request->task_list_id);
        
        if ($newTaskList->project_id !== $task->project_id) {
            return response()->json([
                'message' => 'Task list must belong to the same project',
            ], 422);
        }

        $task->update(['task_list_id' => $request->task_list_id]);

        $task->load(['assignedTo', 'taskList']);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task moved successfully',
        ]);
    }
}