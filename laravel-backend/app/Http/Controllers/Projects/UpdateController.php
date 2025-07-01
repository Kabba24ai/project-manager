<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class UpdateController extends Controller
{
    /**
     * Update a project
     */
    public function __invoke(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        // Update team members if provided
        if ($request->has('team_members')) {
            $teamMembers = collect($request->team_members)->mapWithKeys(function ($userId) {
                return [$userId => ['role' => 'member']];
            });
            
            if ($request->project_manager_id) {
                $teamMembers[$request->project_manager_id] = ['role' => 'manager'];
            }
            
            $project->team()->sync($teamMembers);
        }

        $project->load(['team', 'taskLists']);

        return response()->json([
            'project' => new ProjectResource($project),
            'message' => 'Project updated successfully',
        ]);
    }
}