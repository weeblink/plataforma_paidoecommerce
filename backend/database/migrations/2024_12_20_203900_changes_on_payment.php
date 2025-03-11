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
        Schema::table('user_products', function (Blueprint $table) {
            $table->dropForeign(['payment_id']);
        });

        // Drop existing primary key
        Schema::table('payments', function (Blueprint $table) {
            $table->dropPrimary();
        });

        // Modify the ID column (removed duplicate line)
        Schema::table('payments', function (Blueprint $table) {
            $table->bigInteger('id')->unsigned()->autoIncrement()->primary()->change();

            $table->dropColumn('status');

            $table->enum('status', ['PENDENTE', 'PAGO', 'RECUSADO'])->nullable(false)->default('PENDENTE');
            $table->enum('type', ['pix', 'invoice', 'credit_card'])->nullable(false);
            $table->text('pix_code')->nullable();
            $table->text('pix_qrcode')->nullable();
            $table->timestamp('pix_expiration')->nullable();
            $table->text('invoice_digitable')->nullable();
            $table->text('invoice_code')->nullable();
            $table->text('invoice_link')->nullable();
            $table->timestamp('invoice_expiration')->nullable();
        });

        Schema::table('user_products', function (Blueprint $table) {
            $table->foreign('payment_id')
                ->references('id')
                ->on('payments')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_products', function (Blueprint $table) {
            $table->dropForeign(['payment_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->bigInteger('id')->change();

            $table->dropColumn('status');
            $table->string('status', 15)->nullable(false);

            $table->dropColumn([
                'type',
                'pix_code',
                'pix_qrcode',
                'pix_expiration',
                'invoice_digitable',
                'invoice_code',
                'invoice_link',
                'invoice_expiration'
            ]);
        });

        Schema::table('user_products', function (Blueprint $table) {
            $table->foreign('payment_id')
                ->references('id')
                ->on('payments')
                ->onDelete('set null');
        });
    }
};
