<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_legs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete()->cascadeOnUpdate();
            $table->unsignedSmallInteger('sequence')->default(1);
            $table->string('direction')->nullable()->index();
            $table->foreignId('from_location_id')->constrained('locations')->cascadeOnUpdate();
            $table->foreignId('to_location_id')->constrained('locations')->cascadeOnUpdate();
            $table->timestamp('started_at')->nullable()->index();
            $table->timestamp('ended_at')->nullable()->index();
            $table->decimal('distance_km', 12, 3)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['route_id', 'sequence']);
            $table->index(['route_id', 'direction']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_legs');
    }
};
