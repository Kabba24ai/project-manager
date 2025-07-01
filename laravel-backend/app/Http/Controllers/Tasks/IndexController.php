<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;

class IndexController extends Controller
{
    /**
     * Get all tasks for a task list
     */
    public function __invoke(TaskList $taskList): JsonResponse
    {
        $this->authorize('view', $taskList->project);

        $tasks = $taskList->tasks()
            ->with(['assignedTo', 'comments.user', 'attachments'])
            ->get();

        return response()->json([
            'tasks' => TaskResource::collection($tasks),
        ]);
    }
}