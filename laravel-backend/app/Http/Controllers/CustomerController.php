<?php

namespace App\Http\Controllers;

use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Get all customers for task assignment
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $customers = $query->orderBy('name')->get();

        return response()->json([
            'customers' => CustomerResource::collection($customers),
        ]);
    }

    /**
     * Get specific customer
     */
    public function show(int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        return response()->json([
            'customer' => new CustomerResource($customer),
        ]);
    }
}