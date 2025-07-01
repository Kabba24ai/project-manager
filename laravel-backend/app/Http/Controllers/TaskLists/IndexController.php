<?php

namespace App\Http\Controllers\TaskLists;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskListResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class IndexController extends Controller
{
    /**
     * Get all task lists for a project
     */
    public function __invoke(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $taskLists = $project->taskLists()
            ->with(['tasks.assignedTo', 'tasks.comments'])
            ->get();

        return response()->json([
            'task_lists' => TaskListResource::collection($taskLists),
        ]);
    }
}