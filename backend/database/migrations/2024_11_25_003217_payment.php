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
        Schema::create('payments', function (Blueprint $table) {
            $table->biginteger('id')->primary()->nullable(false);
            $table->uuid('customer_id')->nullable(false);
            $table->uuid('order_id')->nullable(false);
            $table->biginteger('checkout_id')->nullable(false);
            $table->string('status', 15)->nullable(false);
            $table->string('payment_identifier', 255)->nullable(false);
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('checkout_id')->references('id')->on('credentials_checkout')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropForeign(['order_id']);
            $table->dropForeign(['checkout_id']);
            $table->dropIfExists();
        });
    }
};
