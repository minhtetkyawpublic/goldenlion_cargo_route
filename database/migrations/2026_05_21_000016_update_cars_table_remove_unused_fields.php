<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->dropColumn([
                'nickname',
                'make',
                'model',
                'year',
                'capacity',
                'capacity_unit',
                'odometer_km',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table) {
            $table->string('nickname')->nullable();
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->decimal('capacity', 12, 3)->nullable();
            $table->string('capacity_unit')->nullable();
            $table->unsignedInteger('odometer_km')->nullable();
        });
    }
};
