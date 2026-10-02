<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\DeviceModel;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductStockUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_stock_count_from_zero_to_ten_and_back_to_zero(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $deviceModel = $this->createDeviceModel();
        $product = Product::create([
            'device_model_id' => $deviceModel->id,
            'name' => 'Replacement Battery',
            'slug' => 'replacement-battery',
            'part_number' => 'BAT-100',
            'description' => 'Original replacement battery.',
            'price' => 19.99,
            'stock_count' => 0,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/products/{$product->slug}", [
                '_method' => 'PATCH',
                'device_model_id' => $deviceModel->id,
                'name' => 'Replacement Battery',
                'slug' => 'replacement-battery',
                'part_number' => 'BAT-100',
                'description' => 'Original replacement battery.',
                'price' => '19.99',
                'stock_count' => '10',
            ])
            ->assertOk()
            ->assertJsonPath('data.stock_count', 10);

        $this->assertSame(10, $product->refresh()->stock_count);

        $this->actingAs($admin, 'sanctum')
            ->postJson("/api/admin/products/{$product->slug}", [
                '_method' => 'PATCH',
                'device_model_id' => $deviceModel->id,
                'name' => 'Replacement Battery',
                'slug' => 'replacement-battery',
                'part_number' => 'BAT-100',
                'description' => 'Original replacement battery.',
                'price' => '19.99',
                'stock_count' => '0',
            ])
            ->assertOk()
            ->assertJsonPath('data.stock_count', 0);

        $this->assertSame(0, $product->refresh()->stock_count);
    }

    private function createDeviceModel(): DeviceModel
    {
        $brand = Brand::create([
            'name' => 'Apple',
            'slug' => 'apple',
        ]);

        $category = Category::create([
            'brand_id' => $brand->id,
            'name' => 'Phones',
            'slug' => 'phones',
        ]);

        return DeviceModel::create([
            'category_id' => $category->id,
            'name' => 'iPhone 15',
            'slug' => 'iphone-15',
        ]);
    }
}
