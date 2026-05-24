<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained('cars')->cascadeOnUpdate();
            $table->foreignId('origin_location_id')->constrained('locations')->cascadeOnUpdate();
            $table->foreignId('destination_location_id')->constrained('locations')->cascadeOnUpdate();
            $table->string('status')->default('planned')->index();
            $table->timestamp('started_at')->nullable()->index();
            $table->timestamp('ended_at')->nullable()->index();
            $table->decimal('distance_km', 12, 3)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['car_id', 'started_at']);
            $table->index(['origin_location_id', 'destination_location_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
