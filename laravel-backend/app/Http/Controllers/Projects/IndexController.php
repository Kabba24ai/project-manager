<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class IndexController extends Controller
{
    /**
     * Get all projects for authenticated user
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = Project::with(['team', 'taskLists.tasks'])
            ->forUser($request->user())
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->orderBy('created_at', 'desc');
            
        // Laravel 12 pagination support
        if ($request->has('per_page')) {
            $projects = $query->paginate($request->per_page);
            return response()->json([
                'projects' => ProjectResource::collection($projects->items()),
                'pagination' => [
                    'current_page' => $projects->currentPage(),
                    'last_page' => $projects->lastPage(),
                    'per_page' => $projects->perPage(),
                    'total' => $projects->total(),
                ],
            ]);
        }
        
        $projects = $query->get();

        return response()->json([
            'projects' => ProjectResource::collection($projects),
        ]);
    }
}