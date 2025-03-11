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
        Schema::create('users_tags', function (Blueprint $table) {
            $table->uuid('user_id')->primary()->nullable(false);
            $table->string('name', 100)->nullable(false);
            $table->enum('product_type', ['course', 'mentorship', 'extra'])->nullable(false);
            $table->uuid('product_id')->nullable(false);

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users_tags', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIfExists();
        });
    }
};
