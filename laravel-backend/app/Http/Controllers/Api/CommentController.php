<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CommentController extends Controller
{
    /**
     * Get all comments for a task
     */
    public function index(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

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

    /**
     * Create a new comment
     */
    public function store(StoreCommentRequest $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

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

    /**
     * Update a comment
     */
    public function update(UpdateCommentRequest $request, Comment $comment): JsonResponse
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

    /**
     * Delete a comment
     */
    public function destroy(Comment $comment): JsonResponse
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