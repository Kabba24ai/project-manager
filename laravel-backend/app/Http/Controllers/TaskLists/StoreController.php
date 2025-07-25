<?php

namespace App\Http\Controllers\TaskLists;

use App\Http\Controllers\Controller as BaseController;
use App\Http\Requests\StoreTaskListRequest;
use App\Http\Resources\TaskListResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class StoreController extends BaseController
{
    /**
     * Create a new task list (Laravel 12 compatible)
     */
    public function __invoke(StoreTaskListRequest $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);
        
        \Log::info('Task list creation request received', [
            'project_id' => $project->id,
            'request_data' => $request->all(),
            'user_id' => $request->user()->id
        ]);

        // Auto-assign order if not provided
        $order = $request->order ?? ($project->taskLists()->max('order') + 1);

        $taskList = $project->taskLists()->create([
            ...$request->validated(),
            'order' => $order,
        ]);

        $taskList->load(['tasks']);
        
        \Log::info('Task list created successfully', [
            'task_list_id' => $taskList->id,
            'task_list_name' => $taskList->name,
            'project_id' => $project->id
        ]);

        // Log the response structure for debugging
        $responseData = [
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list created successfully',
        ];
        
        \Log::info('Task list response data', [
            'response_structure' => array_keys($responseData),
            'task_list_data' => $responseData['task_list']->toArray(request())
        ]);

        return response()->json([
            'task_list' => new TaskListResource($taskList),
            'message' => 'Task list created successfully',
        ], Response::HTTP_CREATED);
    }
}