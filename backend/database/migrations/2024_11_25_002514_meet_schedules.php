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
        Schema::create('meet_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->uuid('group_id')->nullable(false);
            $table->uuid('calendar_times_id')->nullable(false);
            $table->uuid('student_id')->nullable(false);
            $table->boolean('is_available')->default(true)->nullable(false);

            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
            $table->foreign('calendar_times_id')->references('id')->on('calendar_times')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meet_schedules', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropForeign(['calendar_times_id']);
            $table->dropForeign(['student_id']);
            $table->dropIfExists();
        });
    }
};
