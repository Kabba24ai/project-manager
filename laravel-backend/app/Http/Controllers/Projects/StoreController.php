<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class StoreController extends Controller
{
    /**
     * Create a new project with default task lists
     */
    public function __invoke(StoreProjectRequest $request): JsonResponse
    {
        Gate::authorize('create', Project::class);

        DB::beginTransaction();
        
        try {
            // Create the project
            $project = Project::create([
                ...$request->validated(),
                'created_by' => $request->user()->id,
                'status' => $request->status ?? 'active',
                'priority' => $request->priority ?? 'medium',
            ]);

            // Attach team members with roles
            if ($request->has('team_members') && !empty($request->team_members)) {
                $teamMembers = [];
                
                foreach ($request->team_members as $userId) {
                    $role = ($userId == $request->project_manager_id) ? 'manager' : 'member';
                    $teamMembers[$userId] = ['role' => $role];
                }
                
                $project->team()->sync($teamMembers);
            }

            // Create default task lists based on project settings
            $this->createDefaultTaskLists($project);

            // Load relationships for response
            $project->load([
                'team', 
                'projectManager', 
                'taskLists' => function ($query) {
                    $query->orderBy('order');
                }, 
                'creator'
            ]);

            DB::commit();

            return response()->json([
                'project' => new ProjectResource($project),
                'message' => 'Project created successfully',
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'message' => 'Failed to create project',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create default task lists for the project
     */
    private function createDefaultTaskLists(Project $project): void
    {
        $defaultTaskLists = [
            [
                'name' => 'To Do',
                'description' => 'Tasks that are planned but not yet started',
                'color' => 'bg-gray-100',
                'order' => 1
            ],
            [
                'name' => 'In Progress',
                'description' => 'Tasks currently being worked on',
                'color' => 'bg-blue-100',
                'order' => 2
            ],
            [
                'name' => 'Review',
                'description' => 'Tasks completed and awaiting review',
                'color' => 'bg-yellow-100',
                'order' => 3
            ],
            [
                'name' => 'Done',
                'description' => 'Completed and approved tasks',
                'color' => 'bg-green-100',
                'order' => 4
            ]
        ];

        foreach ($defaultTaskLists as $taskListData) {
            TaskList::create([
                'project_id' => $project->id,
                ...$taskListData
            ]);
        }
    }
}