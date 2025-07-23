<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'avatar' => $this->avatar,
            'role' => $this->role,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Additional computed fields (Laravel 12 features)
            'formatted_role' => ucfirst($this->role),
            'initials' => $this->getInitials(),
            'is_manager' => in_array($this->role, ['admin', 'manager']),
            
            // Pivot data when loaded through relationships
            'pivot_role' => $this->whenPivotLoaded('project_user', function () {
                return $this->pivot->role ?? 'member';
            }),
        ];
    }

    /**
     * Get user initials for avatar (Laravel 12 helper method)
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