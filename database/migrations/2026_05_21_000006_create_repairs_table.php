<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained('cars')->cascadeOnUpdate();
            $table->foreignId('route_id')->nullable()->constrained('routes')->nullOnDelete()->cascadeOnUpdate();
            $table->string('status')->default('done')->index();
            $table->date('repaired_on')->nullable()->index();
            $table->unsignedInteger('odometer_km')->nullable();
            $table->string('vendor')->nullable();
            $table->text('description')->nullable();
            $table->decimal('labor_cost', 14, 2)->nullable();
            $table->string('currency', 3)->nullable();
            $table->timestamps();

            $table->index(['car_id', 'repaired_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repairs');
    }
};
