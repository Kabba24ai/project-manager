<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array (Laravel 12 compatible).
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company' => $this->company,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'postal_code' => $this->postal_code,
            'status' => $this->status,
            'notes' => $this->notes,
            'contact_person' => $this->contact_person,
            'website' => $this->website,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Computed fields (Laravel 12 features)
            'full_address' => $this->full_address,
            'is_active' => $this->status === 'active',
            'display_name' => $this->company ? "{$this->name} ({$this->company})" : $this->name,
            'initials' => $this->getInitials(),
            'tasks_count' => $this->whenLoaded('tasks', fn() => $this->tasks->count(), 0),
        ];
    }

    /**
     * Get customer initials for display (Laravel 12 helper method)
     */
    private function getInitials(): string
    {
        $names = explode(' ', $this->name);
        $initials = '';
        
        foreach ($names as $name) {
            $initials .= strtoupper(substr($name, 0, 1));
        }
        
        return substr($initials, 0, 2);
    }
}