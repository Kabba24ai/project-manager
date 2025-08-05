<?php

namespace App\Http\Controllers\Comments;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class IndexController extends Controller
{
    /**
     * Get all comments for a task (Laravel 12 compatible)
     */
    public function __invoke(Task $task): JsonResponse
    {
        // Check if user can view the project
        $this->authorize('view', $task->project);

        \Log::info('Fetching comments for task', [
            'task_id' => $task->id,
            'task_title' => $task->title,
            'user_id' => request()->user()->id
        ]);

        $comments = $task->comments()
            ->with(['user', 'attachments.uploader'])
            ->orderBy('created_at', 'asc')
            ->get();

        \Log::info('Comments fetched successfully', [
            'task_id' => $task->id,
            'comments_count' => $comments->count()
        ]);

        return response()->json([
            'comments' => CommentResource::collection($comments),
            'total' => $comments->count(),
        ]);
    }
}