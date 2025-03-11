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
        Schema::create('whatsapp_campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->jsonb('groups_id')->nullable(false);
            $table->string('title')->nullable(false);
            $table->text('msg1')->nullable(false);
            $table->text('msg2')->nullable(false);
            $table->text('msg3')->nullable(false);
            $table->text('msg4')->nullable(false);
            $table->text('msg5')->nullable(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_campaigns');
    }
};
