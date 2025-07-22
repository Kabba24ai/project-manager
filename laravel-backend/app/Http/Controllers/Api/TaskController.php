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
use Illuminate\Http\Response;

class TaskController extends Controller
{
    /**
     * Get all tasks for a task list
     */
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

    /**
     * Create a new task (Laravel 12 compatible)
     */
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
        ], Response::HTTP_CREATED);
    }

    /**
     * Get a specific task
     */
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

    /**
     * Update a task
     */
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
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $task->update($request->validated());

        $task->load(['assignedTo', 'taskList']);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task updated successfully',
        ]);
    }

    /**
     * Delete a task
     */
    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('update', $task->project);

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully',
        ]);
    }

    /**
     * Move task to different task list
     */
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
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $task->update(['task_list_id' => $request->task_list_id]);

        $task->load(['assignedTo', 'taskList']);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task moved successfully',
        ]);
    }

    /**
     * Create task with file attachments (Laravel 12 compatible)
     */
    public function storeWithAttachments(StoreTaskRequest $request, TaskList $taskList): JsonResponse
    {
        $this->authorize('update', $taskList->project);

        // Create the task first
        $task = $taskList->tasks()->create([
            ...$request->validated(),
            'project_id' => $taskList->project_id,
            'created_by' => $request->user()->id,
        ]);

        // Handle file attachments if provided
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                // Laravel 12 secure filename generation
                $filename = \Illuminate\Support\Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('task_attachments', $filename, 'public');

                $task->attachments()->create([
                    'filename' => $filename,
                    'original_filename' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'uploaded_by' => $request->user()->id,
                ]);
            }
        }

        $task->load(['assignedTo', 'taskList', 'attachments']);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task created successfully with attachments',
        ], Response::HTTP_CREATED);
    }
}