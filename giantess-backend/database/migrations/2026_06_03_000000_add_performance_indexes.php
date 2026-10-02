<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index(['device_model_id', 'id'], 'products_device_model_id_id_index');
            $table->index('part_number', 'products_part_number_index');
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->index(['product_id', 'sort_order'], 'product_images_product_id_sort_order_index');
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropIndex('product_images_product_id_sort_order_index');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_part_number_index');
            $table->dropIndex('products_device_model_id_id_index');
        });
    }
};
