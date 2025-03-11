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
        Schema::create('class', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->uuid('module_id')->nullable(false);
            $table->string('title', 150)->nullable(false);
            $table->text('description')->nullable();
            $table->bigInteger('views')->nullable(false);
            $table->integer('sequence')->nullable(false);
            $table->text('pv_video_id')->nullable(false);

            $table->foreign('module_id')->references('id')->on('courses_modules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class', function (Blueprint $table) {
            $table->dropForeign(['module_id']);
            $table->dropIfExists();
        });
    }
};
