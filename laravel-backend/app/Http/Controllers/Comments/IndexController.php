<?php

namespace App\Http\Controllers\Comments;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class IndexController extends Controller
{
    /**
     * Get all comments for a task
     */
    public function __invoke(Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        $comments = $task->comments()
            ->with(['user', 'attachments'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'comments' => CommentResource::collection($comments),
        ]);
    }
}