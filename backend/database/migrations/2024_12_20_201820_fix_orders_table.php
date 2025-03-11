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
        Schema::table('orders', function (Blueprint $table) {

            $table->dropForeign(['user_product_id']);
            $table->dropColumn('user_product_id');

            $table->enum('type_product', ['course','extra','mentorship'])->nullable(false);

            $table->uuid('product_id')->nullable(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {

            $table->dropColumn(['type_product', 'product_id']);

            $table->unsignedBigInteger('user_product_id')->nullable(false);

            $table->foreign('user_product_id')
                ->references('id')
                ->on('user_products');
        });
    }
};
