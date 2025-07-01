<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IndexController extends Controller
{
    /**
     * Get all projects for authenticated user
     */
    public function __invoke(Request $request): JsonResponse
    {
        $projects = Project::with(['team', 'taskLists.tasks'])
            ->forUser($request->user())
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'projects' => ProjectResource::collection($projects),
        ]);
    }
}