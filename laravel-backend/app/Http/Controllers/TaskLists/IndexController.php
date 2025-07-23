<?php

namespace App\Http\Controllers\TaskLists;

use App\Http\Controllers\Controller as BaseController;
use App\Http\Resources\TaskListResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class IndexController extends BaseController
{
    /**
     * Get all task lists for a project (Laravel 12 compatible)
     */
    public function __invoke(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $taskLists = $project->taskLists()
            ->with(['tasks.assignedTo', 'tasks.comments'])
            ->orderBy('order')
            ->get();

        return response()->json([
            'task_lists' => TaskListResource::collection($taskLists)->values(),
        ]);
    }
}