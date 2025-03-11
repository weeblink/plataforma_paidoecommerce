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
        Schema::create('calendar_times', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->uuid('calendar_id')->nullable(false);
            $table->timestamp('start_time')->nullable(false);
            $table->timestamp('end_time')->nullable(false);
            $table->boolean('is_available')->default(true)->nullable(false);

            $table->foreign('calendar_id')->references('id')->on('calendar')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calendar_times', function (Blueprint $table) {
            $table->dropForeign(['calendar_id']);
            $table->dropIfExists();
        });
    }
};
