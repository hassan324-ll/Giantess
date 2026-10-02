<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BrandCategoryProductSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $brands = [
            [
                'name' => 'Motorola Zebra',
                'slug' => 'motorola-zebra',
                'image' => 'brands/motorola-zebra.png',
                'description' => 'Motorola Zebra offers rugged mobile computers, barcode scanners, and accessories for enterprise operations.',
                'categories' => [
                    [
                        'name' => 'Mobile Computers',
                        'slug' => 'mobile-computers',
                        'image' => 'categories/mobile-computers.png',
                        'models' => [
                            [
                                'name' => 'EC30',
                                'slug' => 'ec30',
                                'image' => 'models/ec30.png',
                                'description' => 'A compact enterprise mobile computer built for fast workflows.',
                                'products' => [
                                    [
                                        'name' => 'EC30 Spare Parts',
                                        'slug' => 'ec30-spare-parts',
                                        'image' => 'products/ec30-spare-parts.png',
                                        'part_number' => 'EC30-SP',
                                        'description' => 'Official spare parts bundle for the Zebra EC30.',
                                        'price' => 129.99,
                                    ],
                                    [
                                        'name' => 'EC30 Battery',
                                        'slug' => 'ec30-battery',
                                        'image' => 'products/ec30-battery.png',
                                        'part_number' => 'EC30-BAT',
                                        'description' => 'High-capacity replacement battery for the EC30.',
                                        'price' => 49.99,
                                    ],
                                ],
                            ],
                            [
                                'name' => 'MC3300',
                                'slug' => 'mc3300',
                                'image' => 'models/mc3300.png',
                                'description' => 'Versatile handheld computer for inventory and logistics.',
                                'products' => [
                                    [
                                        'name' => 'MC3300 Charger',
                                        'slug' => 'mc3300-charger',
                                        'image' => 'products/mc3300-charger.png',
                                        'part_number' => 'MC3300-CH',
                                        'description' => 'Fast charging cradle for the MC3300.',
                                        'price' => 39.99,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'name' => 'Barcode Scanners',
                        'slug' => 'barcode-scanners',
                        'image' => 'categories/barcode-scanners.png',
                        'models' => [
                            [
                                'name' => 'DS2208',
                                'slug' => 'ds2208',
                                'image' => 'models/ds2208.png',
                                'description' => 'A dependable handheld barcode scanner for retail and inventory applications.',
                                'products' => [
                                    [
                                        'name' => 'DS2208 Replacement Cable',
                                        'slug' => 'ds2208-replacement-cable',
                                        'image' => 'products/ds2208-replacement-cable.png',
                                        'part_number' => 'DS2208-CBL',
                                        'description' => 'USB replacement cable for the DS2208 scanner.',
                                        'price' => 15.99,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Honeywell',
                'slug' => 'honeywell',
                'image' => 'brands/honeywell.png',
                'description' => 'Honeywell provides rugged barcode scanners and mobile computers for industrial operations.',
                'categories' => [
                    [
                        'name' => 'Mobile Computers',
                        'slug' => 'mobile-computers-honeywell',
                        'image' => 'categories/mobile-computers-honeywell.png',
                        'models' => [
                            [
                                'name' => 'Dolphin CT60',
                                'slug' => 'dolphin-ct60',
                                'image' => 'models/dolphin-ct60.png',
                                'description' => 'A rugged mobile computer built for demanding environments.',
                                'products' => [
                                    [
                                        'name' => 'Dolphin CT60 Battery',
                                        'slug' => 'dolphin-ct60-battery',
                                        'image' => 'products/dolphin-ct60-battery.png',
                                        'part_number' => 'CT60-BAT',
                                        'description' => 'Durable battery pack for the Dolphin CT60.',
                                        'price' => 59.99,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'name' => 'Barcode Scanners',
                        'slug' => 'barcode-scanners-honeywell',
                        'image' => 'categories/barcode-scanners-honeywell.png',
                        'models' => [
                            [
                                'name' => 'Xenon 1950',
                                'slug' => 'xenon-1950',
                                'image' => 'models/xenon-1950.png',
                                'description' => 'High-performance area-imaging barcode scanner for retail and warehouse.',
                                'products' => [
                                    [
                                        'name' => 'Xenon 1950 Stand',
                                        'slug' => 'xenon-1950-stand',
                                        'image' => 'products/xenon-1950-stand.png',
                                        'part_number' => 'X1950-STD',
                                        'description' => 'Hands-free stand for the Xenon 1950 scanner.',
                                        'price' => 69.99,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($brands as $brandData) {
            $categories = $brandData['categories'];
            unset($brandData['categories']);

            $brand = Brand::create($brandData);

            foreach ($categories as $categoryData) {
                $models = $categoryData['models'];
                unset($categoryData['models']);

                $category = $brand->categories()->create($categoryData);

                foreach ($models as $modelData) {
                    $products = $modelData['products'];
                    unset($modelData['products']);

                    $deviceModel = $category->deviceModels()->create($modelData);

                    foreach ($products as $productData) {
                        $deviceModel->products()->create($productData);
                    }
                }
            }
        }
    }
}
