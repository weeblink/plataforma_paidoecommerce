<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->biginteger('products_value')->nullable(false);
            $table->biginteger('discount_value')->nullable(false);
            $table->biginteger('shipping_value')->nullable(false);
            $table->enum('type_payment', ['credit_card', 'pix', 'invoice'])->nullable(false);
            $table->biginteger('user_product_id')->nullable(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['user_product_id']);
            $table->dropIfExists();
        });
    }
};
