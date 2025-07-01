<?php

namespace App\Http\Controllers\TaskLists;

use App\Http\Controllers\Controller;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;

class DeleteController extends Controller
{
    /**
     * Delete a task list
     */
    public function __invoke(TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        // Check if task list has tasks
        if ($taskList->tasks()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete task list with existing tasks. Please move or delete all tasks first.',
            ], 422);
        }

        $taskList->delete();

        return response()->json([
            'message' => 'Task list deleted successfully',
        ]);
    }
}