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
        Schema::table('meet_schedules', function (Blueprint $table) {
            $table->boolean('group_meeting')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('meet_schedules', function (Blueprint $table) {
            $table->dropColumn('group_meeting');
        });
    }
};
