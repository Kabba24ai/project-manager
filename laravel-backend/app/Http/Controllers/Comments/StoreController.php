<?php

namespace App\Http\Controllers\Comments;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class StoreController extends Controller
{
    /**
     * Create a new comment (Laravel 12 compatible)
     */
    public function __invoke(StoreCommentRequest $request, Task $task): JsonResponse
    {
        // Check if user can view the project
        $this->authorize('view', $task->project);

        \Log::info('Creating comment for task', [
            'task_id' => $task->id,
            'task_title' => $task->title,
            'user_id' => $request->user()->id,
            'content_length' => strlen($request->content)
        ]);

        $comment = $task->comments()->create([
            'content' => $request->content,
            'user_id' => $request->user()->id,
        ]);

        // Load relationships for response
        $comment->load(['user', 'attachments.uploader']);

        \Log::info('Comment created successfully', [
            'comment_id' => $comment->id,
            'task_id' => $task->id,
            'user_name' => $comment->user->name
        ]);

        return response()->json([
            'comment' => new CommentResource($comment),
            'message' => 'Comment added successfully',
        ], Response::HTTP_CREATED);
    }
}