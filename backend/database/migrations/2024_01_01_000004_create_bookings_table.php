<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('turf_id')->constrained('turfs')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            // Remove player_id foreign key constraint for now
            $table->unsignedBigInteger('player_id')->nullable();
            $table->enum('booking_type', ['online', 'offline'])->default('online');
            $table->enum('booking_plan', ['single', 'daily', 'weekly', 'monthly', 'yearly'])->default('single');
            $table->date('date');
            $table->date('plan_start_date')->nullable();
            $table->date('plan_end_date')->nullable();
            $table->json('recurring_days')->nullable();
            $table->time('start_time');
            $table->time('end_time');
            $table->json('selected_slots')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('customer_phone', 20)->nullable();
            $table->string('customer_email')->nullable();
            $table->decimal('amount', 10, 2);
            $table->decimal('advance_amount', 10, 2)->default(0);
            $table->decimal('remaining_amount', 10, 2)->default(0);
            $table->decimal('commission', 8, 2)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index(['turf_id', 'date', 'status']);
            $table->index(['date', 'status']);
            $table->index('booking_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};