<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskListRequest;
use App\Http\Requests\UpdateTaskListRequest;
use App\Http\Resources\TaskListResource;
use App\Models\Project;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class TaskListController extends Controller
{
    /**
     * Get all task lists for a project (Laravel 12 compatible)
     */
    public function index(Project $project): JsonResponse
    {
        $this->authorize('view', $project);

        $taskLists = $project->taskLists()
            ->with(['tasks.assignedTo', 'tasks.comments'])
            ->orderBy('order')
            ->get();

        return response()->json([
            'task_lists' => TaskListResource::collection($taskLists),
        ]);
    }

    /**
     * Create a new task list (Laravel 12 compatible)
     */
    public function store(StoreTaskListRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        // Auto-assign order if not provided
        $order = $request->order ?? ($project->taskLists()->max('order') + 1);

        $taskList = $project->taskLists()->create([
            ...$request->validated(),
            'order' => $order,
        ]);

        $taskList->load(['tasks']);

        return response()->json([
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list created successfully',
        ], Response::HTTP_CREATED);
    }

    /**
     * Get a specific task list
     */
    public function show(TaskList $taskList): JsonResponse
    {
        $this->authorize('view', $taskList->project);

        $taskList->load(['tasks.assignedTo', 'tasks.comments', 'tasks.attachments']);

        return response()->json([
            'task_list' => new TaskListResource($taskList),
        ]);
    }

    /**
     * Update a task list (Laravel 12 compatible)
     */
    public function update(UpdateTaskListRequest $request, TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        $taskList->update($request->validated());

        $taskList->load(['tasks']);

        return response()->json([
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list updated successfully',
        ]);
    }

    /**
     * Delete a task list (Laravel 12 compatible)
     */
    public function destroy(TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        // Check if task list has tasks
        if ($taskList->tasks()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete task list with existing tasks. Please move or delete all tasks first.',
                'error' => 'TASK_LIST_NOT_EMPTY',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $taskList->delete();

        return response()->json([
            'message' => 'Task list deleted successfully',
        ]);
    }

    /**
     * Reorder task lists (Laravel 12 feature)
     */
    public function reorder(Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        request()->validate([
            'task_lists' => 'required|array',
            'task_lists.*.id' => 'required|exists:task_lists,id',
            'task_lists.*.order' => 'required|integer|min:0',
        ]);

        foreach (request('task_lists') as $taskListData) {
            TaskList::where('id', $taskListData['id'])
                   ->where('project_id', $project->id)
                   ->update(['order' => $taskListData['order']]);
        }

        $taskLists = $project->taskLists()
            ->with(['tasks'])
            ->orderBy('order')
            ->get();

        return response()->json([
            'task_lists' => TaskListResource::collection($taskLists),
            'message' => 'Task lists reordered successfully',
        ]);
    }
}