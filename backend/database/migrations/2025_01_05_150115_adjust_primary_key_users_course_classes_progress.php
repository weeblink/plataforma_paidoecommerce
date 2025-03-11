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
        Schema::table('users_course_classes_progress', function (Blueprint $table) {
            $table->dropPrimary();
            $table->primary(['user_product_id', 'class_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users_course_classes_progress', function (Blueprint $table) {
            $table->dropPrimary();
            $table->primary('user_product_id');
        });
    }
};
