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
        Schema::create('users_course_classes_progress', function (Blueprint $table) {
            $table->biginteger('user_product_id')->primary()->nullable(false);
            $table->uuid('class_id')->nullable(false);
            $table->integer('time_viewed')->nullable(false);
            $table->integer('completion_percentage')->nullable(false);
            $table->boolean('already_seen')->nullable(false);
    
            $table->foreign('user_product_id')->references('id')->on('user_products')->onDelete('cascade');
            $table->foreign('class_id')->references('id')->on('class')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users_course_classes_progress', function (Blueprint $table) {
            $table->dropForeign(['user_products_id']);
            $table->dropForeign(['class']);
            $table->dropIfExists();
        });
    }
};
