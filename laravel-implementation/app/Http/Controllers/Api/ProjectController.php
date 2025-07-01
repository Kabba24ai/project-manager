<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::with(['team', 'taskLists.tasks'])
            ->forUser($request->user())
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'projects' => ProjectResource::collection($projects),
        ]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
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

    public function show(Project $project): JsonResponse
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

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
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

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ]);
    }
}