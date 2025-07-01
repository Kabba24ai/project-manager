<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    /**
     * Create a new project
     */
    public function __invoke(StoreProjectRequest $request): JsonResponse
    {
        $project = Project::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        // Attach team members
        if ($request->has('team_members')) {
            $teamMembers = collect($request->team_members)->mapWithKeys(function ($userId) {
                return [$userId => ['role' => 'member']];
            });
            
            // Add project manager with manager role
            if ($request->project_manager_id) {
                $teamMembers[$request->project_manager_id] = ['role' => 'manager'];
            }
            
            $project->team()->sync($teamMembers);
        }

        $project->load(['team', 'taskLists']);

        return response()->json([
            'project' => new ProjectResource($project),
            'message' => 'Project created successfully',
        ], 201);
    }
}