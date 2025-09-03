<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revenue_models', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['subscription', 'commission', 'fixed'])->default('subscription');
            $table->decimal('price', 10, 2);
            $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly');
            $table->json('features')->nullable();
            $table->integer('turf_limit')->nullable();
            $table->integer('staff_limit')->nullable();
            $table->integer('booking_limit')->nullable();
            $table->decimal('commission_rate', 5, 2)->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revenue_models');
    }
};