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
        Schema::create('attachments', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->uuid('class_id')->nullable(false);
            $table->string('title',150)->nullable(false);
            $table->text('path')->nullable(false);
            $table->decimal('size', 10, 2)->nullable(false);

            $table->foreign('class_id')->references('id')->on('class')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attachments', function (Blueprint $table) {
            $table->dropForeign(['class_id']);
            $table->dropIfExists();
        });
    }
};
