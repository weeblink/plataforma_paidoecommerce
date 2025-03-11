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
        Schema::create('email_marketing', function (Blueprint $table) {
            $table->uuid('id')->primary()->nullable(false);
            $table->boolean('broadcast')->nullable(false);
            $table->text('message')->nullable(false);
            $table->integer('contacts_count')->default(0)->nullable(false);
            $table->string('type_action', 10)->nullable(false);
            $table->string('link', 255)->nullable(false);
            $table->string('file_url', 255)->nullable(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_marketing');
    }
};
