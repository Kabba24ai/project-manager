<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class ShowController extends Controller
{
    /**
     * Get a specific project with full details (Laravel 12 compatible)
     */
    public function __invoke(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        // Load all necessary relationships for project details
        $project->load([
            'creator',
            'projectManager', 
            'team',
            'taskLists' => function ($query) {
                $query->orderBy('order');
            },
            'taskLists.tasks' => function ($query) {
                $query->orderByRaw("
                    CASE priority 
                        WHEN 'urgent' THEN 1 
                        WHEN 'high' THEN 2 
                        WHEN 'medium' THEN 3 
                        WHEN 'low' THEN 4 
                        ELSE 5 
                    END, title ASC
                ");
            },
            'taskLists.tasks.assignedTo',
            'taskLists.tasks.creator',
            'taskLists.tasks.comments.user',
            'taskLists.tasks.attachments.uploader'
        ]);

        return response()->json([
            'project' => new ProjectResource($project),
        ]);
    }
}