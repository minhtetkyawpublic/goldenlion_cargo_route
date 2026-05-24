<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repair_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repair_id')->constrained('repairs')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnUpdate();
            $table->decimal('quantity', 12, 3)->default(0);
            $table->decimal('unit_cost', 14, 2)->nullable();
            $table->decimal('total_cost', 14, 2)->nullable();
            $table->string('currency', 3)->nullable();
            $table->timestamps();

            $table->index(['repair_id', 'inventory_item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repair_parts');
    }
};
