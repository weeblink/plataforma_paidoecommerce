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
        Schema::create('user_products', function (Blueprint $table) {
            $table->biginteger('id')->primary()->nullable(false);
            $table->uuid('user_id')->nullable(false);
            $table->biginteger('payment_id')->nullable(false);
            $table->enum('type_product', ['course', 'mentorship', 'extra'])->nullable(false);
            $table->uuid('course_id')->nullable(false);
            $table->uuid('mentorship_id')->nullable(false);
            $table->uuid('extra_id')->nullable(false);
            $table->uuid('last_class_seen')->nullable(false);

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            $table->foreign('mentorship_id')->references('id')->on('mentorships')->onDelete('cascade');
            $table->foreign('extra_id')->references('id')->on('extras')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users_products', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['payment_id']);
            $table->dropForeign(['course_id']);
            $table->dropForeign(['mentorship_id']);
            $table->dropForeign(['extra_id']);
            $table->dropIfExists();
        });
    }
};
