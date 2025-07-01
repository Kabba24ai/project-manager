<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class DeleteController extends Controller
{
    /**
     * Delete a task
     */
    public function __invoke(Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }
}