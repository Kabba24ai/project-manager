<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UsersController extends Controller
{
    /**
     * Get all users for team selection
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Filter by role if specified
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Exclude specific users if needed
        if ($request->has('exclude')) {
            $exclude = is_array($request->exclude) ? $request->exclude : [$request->exclude];
            $query->whereNotIn('id', $exclude);
        }

        $users = $query->orderBy('name')->get();

        return response()->json([
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * Get users who can be project managers
     */
    public function managers(): JsonResponse
    {
        $managers = User::whereIn('role', ['admin', 'manager'])
                       ->orderBy('name')
                       ->get();

        return response()->json([
            'managers' => UserResource::collection($managers),
        ]);
    }
}