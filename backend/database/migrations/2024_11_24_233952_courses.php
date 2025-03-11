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
        Schema::create('courses', function (Blueprint $table) {
           $table->uuid('id')->primary()->nullable(false);
           $table->string('title', 100)->nullable(false);
           $table->decimal('price', 10, 2)->nullable(false);
           $table->decimal('promotional_price', 10, 2)->nullable(false);
           $table->integer('qnt_class')->default(0)->nullable(false);
           $table->integer('qnt_students')->default(0)->nullable(false);
           $table->string('image_url')->nullable(false);
           $table->boolean('is_pay')->default(false)->nullable(false);
           $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropIfExists();
        });
    }
};
