<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(TaskList $taskList): JsonResponse
    {
        $this->authorize('view', $taskList->project);

        $tasks = $taskList->tasks()
            ->with(['assignedTo', 'comments.user', 'attachments'])
            ->get();

        return response()->json([
            'tasks' => TaskResource::collection($tasks),
        ]);
    }

    public function store(StoreTaskRequest $request, TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        $task = $taskList->tasks()->create([
            ...$request->validated(),
            'project_id' => $taskList->project_id,
            'created_by' => $request->user()->id,
        ]);

        $task->load(['assignedTo', 'taskList']);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task created successfully',
        ], 201);
    }

    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        $task->load([
            'assignedTo',
            'taskList',
            'comments.user',
            'comments.attachments',
            'attachments'
        ]);

        return response()->json([
            'task' => new TaskResource($task),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        // Handle task list change
        if ($request->has('task_list_id') && $request->task_list_id != $task->task_list_id) {
            $newTaskList = TaskList::findOrFail($request->task_list_id);
            
            // Ensure the new task list belongs to the same project
            if ($newTaskList->project_id !== $task->project_id) {
                return response()->json([
                    'message' => 'Task list must belong to the same project',
                ], 422);
            }
        }

        $task->update($request->validated());

        $task->load(['assignedTo', 'taskList']);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task updated successfully',
        ]);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }

    public function moveToList(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $request->validate([
            'task_list_id' => 'required|exists:task_lists,id',
        ]);

        $newTaskList = TaskList::findOrFail($request->task_list_id);
        
        if ($newTaskList->project_id !== $task->project_id) {
            return response()->json([
                'message' => 'Task list must belong to the same project',
            ], 422);
        }

        $task->update(['task_list_id' => $request->task_list_id]);

        $task->load(['assignedTo', 'taskList']);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task moved successfully',
        ]);
    }
}