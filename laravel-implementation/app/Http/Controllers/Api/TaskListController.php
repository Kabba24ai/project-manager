<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskListRequest;
use App\Http\Requests\UpdateTaskListRequest;
use App\Http\Resources\TaskListResource;
use App\Models\Project;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;

class TaskListController extends Controller
{
    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $taskLists = $project->taskLists()
            ->with(['tasks.assignedTo', 'tasks.comments'])
            ->get();

        return response()->json([
            'task_lists' => TaskListResource::collection($taskLists),
        ]);
    }

    public function store(StoreTaskListRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $taskList = $project->taskLists()->create($request->validated());

        $taskList->load(['tasks']);

        return response()->json([
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list created successfully',
        ], 201);
    }

    public function update(UpdateTaskListRequest $request, TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        $taskList->update($request->validated());

        return response()->json([
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list updated successfully',
        ]);
    }

    public function destroy(TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        // Move tasks to another list or delete them
        if ($taskList->tasks()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete task list with existing tasks',
            ], 422);
        }

        $taskList->delete();

        return response()->json([
            'message' => 'Task list deleted successfully',
        ]);
    }
}