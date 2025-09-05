<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('turfs', function (Blueprint $table) {
            // Only add fields that don't exist yet
            // contact_number, email, price_per_hour, facilities, description already exist
            
            // Hours
            $table->time('opening_time')->nullable()->after('price_per_hour');
            $table->time('closing_time')->nullable()->after('opening_time');
            
            // Turf Details
            $table->enum('turf_type', ['football', 'cricket', 'badminton', 'tennis', 'basketball', 'multi_sport'])->nullable()->after('closing_time');
            $table->enum('surface_type', ['natural_grass', 'artificial_turf', 'concrete', 'wooden', 'synthetic'])->nullable()->after('turf_type');
            $table->string('size')->nullable()->after('surface_type');
            
            // Facilities (boolean fields)
            $table->boolean('parking_available')->default(false)->after('size');
            $table->boolean('changing_rooms')->default(false)->after('parking_available');
            $table->boolean('washrooms')->default(false)->after('changing_rooms');
            $table->boolean('lighting')->default(false)->after('washrooms');
            $table->boolean('water_facility')->default(false)->after('lighting');
            $table->boolean('first_aid')->default(false)->after('water_facility');
            $table->boolean('security')->default(false)->after('first_aid');
            
            // Text Fields
            $table->text('rules')->nullable()->after('description');
            
            // Media and Tags
            $table->json('images')->nullable()->after('facilities');
            $table->json('videos')->nullable()->after('images');
            $table->json('documents')->nullable()->after('videos');
            $table->string('hashtags')->nullable()->after('documents');
        });
    }

    public function down()
    {
        Schema::table('turfs', function (Blueprint $table) {
            $table->dropColumn([
                'opening_time', 'closing_time', 'turf_type', 'surface_type', 'size',
                'parking_available', 'changing_rooms', 'washrooms', 'lighting',
                'water_facility', 'first_aid', 'security', 'rules', 'images',
                'videos', 'documents', 'hashtags'
            ]);
        });
    }
};