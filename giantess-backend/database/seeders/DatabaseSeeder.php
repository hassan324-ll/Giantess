<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        if (!User::where('email', 'test@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // Create admin user
        if (!User::where('email', 'admin@giantess.com')->exists()) {
            User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@giantess.com',
                'password' => Hash::make('Admin@123'),
                'is_admin' => true,
            ]);
        }

        $this->call([
            BrandCategoryProductSeeder::class,
        ]);
    }
}
