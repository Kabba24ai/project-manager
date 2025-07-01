<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class ShowController extends Controller
{
    /**
     * Get a specific project
     */
    public function __invoke(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $project->load([
            'team',
            'taskLists.tasks.assignedTo',
            'taskLists.tasks.comments.user',
            'taskLists.tasks.attachments'
        ]);

        return response()->json([
            'project' => new ProjectResource($project),
        ]);
    }
}