<?php

namespace App\Http\Controllers\Comments;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;

class UpdateController extends Controller
{
    /**
     * Update a comment (Laravel 12 compatible)
     */
    public function __invoke(UpdateCommentRequest $request, Comment $comment): JsonResponse
    {
        $this->authorize('update', $comment);

        \Log::info('Updating comment', [
            'comment_id' => $comment->id,
            'task_id' => $comment->task_id,
            'user_id' => $request->user()->id
        ]);

        $comment->update($request->validated());

        $comment->load(['user', 'attachments.uploader']);

        \Log::info('Comment updated successfully', [
            'comment_id' => $comment->id,
            'updated_by' => $request->user()->name
        ]);

        return response()->json([
            'comment' => new CommentResource($comment),
            'message' => 'Comment updated successfully',
        ]);
    }
}