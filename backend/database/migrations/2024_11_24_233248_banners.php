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
        Schema::create('banners', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->string('title')->nullable(false);
            $table->string('alt')->nullable(false);
            $table->string('image_url')->nullable(false);
            $table->string('link_action')->nullable(false);
            $table->integer('position')->nullable(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropIfExists();
        });
    }
};
