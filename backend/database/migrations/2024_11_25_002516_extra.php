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
        Schema::create('extras', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->string('title', 100)->nullable(false);
            $table->decimal('price', 10, 2)->nullable(false);
            $table->decimal('promotional_price', 10, 2)->nullable(false);
            $table->string('image_url', 255)->nullable(false);
            $table->string('file_url', 255)->nullable(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {  
        Schema::dropIfExists('extras');
    }
};
