<?php

namespace App\Http\Controllers\Comments;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;

class DeleteController extends Controller
{
    /**
     * Delete a comment (Laravel 12 compatible)
     */
    public function __invoke(Comment $comment): JsonResponse
    {
        $this->authorize('delete', $comment);

        \Log::info('Deleting comment', [
            'comment_id' => $comment->id,
            'task_id' => $comment->task_id,
            'user_id' => request()->user()->id
        ]);

        $comment->delete();

        \Log::info('Comment deleted successfully', [
            'comment_id' => $comment->id
        ]);

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }
}