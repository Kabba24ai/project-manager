<?php

namespace App\Http\Controllers;

use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    /**
     * Get all equipment for task assignment
     */
    public function index(Request $request): JsonResponse
    {
        $query = Equipment::query();

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $equipment = $query->orderBy('name')->get();

        return response()->json([
            'equipment' => EquipmentResource::collection($equipment),
        ]);
    }

    /**
     * Get specific equipment
     */
    public function show(int $id): JsonResponse
    {
        $equipment = Equipment::findOrFail($id);

        return response()->json([
            'equipment' => new EquipmentResource($equipment),
        ]);
    }
}