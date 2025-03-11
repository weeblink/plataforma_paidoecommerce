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
        Schema::table('user_products', function (Blueprint $table) {
            $table->uuid('course_id')->nullable()->change();
            $table->uuid('mentorship_id')->nullable()->change();
            $table->uuid('extra_id')->nullable()->change();
            $table->uuid('last_class_seen')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_products', function (Blueprint $table) {
            $table->uuid('course_id')->nullable(false)->change();
            $table->uuid('mentorship_id')->nullable(false)->change();
            $table->uuid('extra_id')->nullable(false)->change();
            $table->uuid('last_class_seen')->nullable(false)->change();
        });
    }
};
