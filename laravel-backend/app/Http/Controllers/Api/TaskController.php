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
use Illuminate\Support\Str;

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
        
        \Log::info('Task creation request received', [
            'task_list_id' => $taskList->id,
            'project_id' => $taskList->project_id,
            'request_data' => $request->all(),
            'user_id' => $request->user()->id
        ]);

        // Validate that assigned user exists and is part of the project team
        $assignedUser = \App\Models\User::findOrFail($request->assigned_to);
        if (!$taskList->project->team->contains($assignedUser->id) && 
            $taskList->project->project_manager_id !== $assignedUser->id) {
            \Log::warning('Task creation failed: User not in project team', [
                'assigned_user_id' => $assignedUser->id,
                'project_id' => $taskList->project_id,
                'team_member_ids' => $taskList->project->team->pluck('id')->toArray()
            ]);
            
            return response()->json([
                'message' => 'Assigned user must be a member of the project team',
                'error' => 'USER_NOT_IN_TEAM',
                'debug' => [
                    'assigned_user' => $assignedUser->name,
                    'project_team' => $taskList->project->team->pluck('name')->toArray()
                ]
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        \Log::info('Creating task with validated data', [
            'task_list_id' => $taskList->id,
            'assigned_to' => $request->assigned_to,
            'created_by' => $request->user()->id
        ]);
        
        $task = $taskList->tasks()->create([
            'project_id' => $taskList->project_id,
            'task_list_id' => $taskList->id,
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority ?? 'medium',
            'task_type' => $request->task_type ?? 'general',
            'assigned_to' => $request->assigned_to,
            'created_by' => $request->user()->id,
            'start_date' => $request->start_date,
            'due_date' => $request->due_date,
            'estimated_hours' => $request->estimated_hours,
            'tags' => $request->tags ?? [],
            'equipment_id' => $request->equipment_id,
            'customer_id' => $request->customer_id,
        ]);

        // Load relationships for response
        $task->load(['assignedTo', 'creator', 'taskList', 'project']);
        
        \Log::info('Task created successfully', [
            'task_id' => $task->id,
            'task_title' => $task->title,
            'assigned_to' => $task->assignedTo->name
        ]);

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

        \Log::info('Task with attachments creation request received', [
            'task_list_id' => $taskList->id,
            'project_id' => $taskList->project_id,
            'has_files' => $request->hasFile('attachments'),
            'user_id' => $request->user()->id
        ]);

        // Validate that assigned user exists and is part of the project team
        $assignedUser = \App\Models\User::findOrFail($request->assigned_to);
        if (!$taskList->project->team->contains($assignedUser->id) && 
            $taskList->project->project_manager_id !== $assignedUser->id) {
            return response()->json([
                'message' => 'Assigned user must be a member of the project team',
                'error' => 'USER_NOT_IN_TEAM',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Create the task first
        $task = $taskList->tasks()->create([
            'project_id' => $taskList->project_id,
            'task_list_id' => $taskList->id,
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority ?? 'medium',
            'task_type' => $request->task_type ?? 'general',
            'assigned_to' => $request->assigned_to,
            'created_by' => $request->user()->id,
            'start_date' => $request->start_date,
            'due_date' => $request->due_date,
            'estimated_hours' => $request->estimated_hours,
            'tags' => $request->tags ?? [],
            'equipment_id' => $request->equipment_id,
            'customer_id' => $request->customer_id,
        ]);

        // Handle file attachments if provided
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                // Laravel 12 secure filename generation
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
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

        \Log::info('Task with attachments created successfully', [
            'task_id' => $task->id,
            'attachments_count' => $task->attachments->count()
        ]);

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task created successfully with attachments',
        ], Response::HTTP_CREATED);
    }
}