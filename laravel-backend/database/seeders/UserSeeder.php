<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@taskmaster.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@taskmaster.com',
                'password' => Hash::make('password'),
                'role' => 'manager',
            ],
            [
                'name' => 'Mike Chen',
                'email' => 'mike.chen@taskmaster.com',
                'password' => Hash::make('password'),
                'role' => 'developer',
            ],
            [
                'name' => 'Emily Rodriguez',
                'email' => 'emily.rodriguez@taskmaster.com',
                'password' => Hash::make('password'),
                'role' => 'designer',
            ],
            [
                'name' => 'David Kim',
                'email' => 'david.kim@taskmaster.com',
                'password' => Hash::make('password'),
                'role' => 'developer',
            ],
            [
                'name' => 'Lisa Wang',
                'email' => 'lisa.wang@taskmaster.com',
                'password' => Hash::make('password'),
                'role' => 'developer',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}