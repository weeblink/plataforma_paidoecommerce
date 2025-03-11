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
        Schema::create('courses_modules', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->uuid('course_id')->nullable(false);
            $table->string('title', 150)->nullable(false);
            $table->integer('sequence')->nullable(false);
            $table->integer('qnt_class')->default(0)->nullable(false);
            $table->decimal('qnt_timeclass', 10, 2)->nullable(false);

            $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses_modules', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropIfExists();
        });
    }
};
