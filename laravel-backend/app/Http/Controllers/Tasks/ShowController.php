<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class ShowController extends Controller
{
    /**
     * Get a specific task
     */
    public function __invoke(Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        $task->load([
            'assignedTo',
            'taskList',
            'comments.user',
            'comments.attachments',
            'attachments'
        ]);

        return response()->json([
            'task' => new TaskResource($task),
        ]);
    }
}