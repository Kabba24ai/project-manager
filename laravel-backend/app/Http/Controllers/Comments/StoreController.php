<?php

namespace App\Http\Controllers\Comments;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    /**
     * Create a new comment
     */
    public function __invoke(StoreCommentRequest $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task->project);

        $comment = $task->comments()->create([
            'content' => $request->content,
            'user_id' => $request->user()->id,
        ]);

        $comment->load(['user', 'attachments']);

        return response()->json([
            'comment' => new CommentResource($comment),
            'message' => 'Comment added successfully',
        ], 201);
    }
}