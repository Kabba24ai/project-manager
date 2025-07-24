<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\TaskList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    /**
     * Create a new task
     */
    public function __invoke(StoreTaskRequest $request, TaskList $taskList): JsonResponse
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
     * Create a new task with file attachments (Laravel 12 compatible)
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

        return response()->json([
            'task' => new TaskResource($task),
            'message' => 'Task created successfully with attachments',
        ], Response::HTTP_CREATED);
    }
}