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
     * Update a comment
     */
    public function __invoke(UpdateCommentRequest $request, Comment $comment): JsonResponse
    {
        $this->authorize('update', $comment);

        $comment->update($request->validated());

        $comment->load(['user', 'attachments']);

        return response()->json([
            'comment' => new CommentResource($comment),
            'message' => 'Comment updated successfully',
        ]);
    }
}