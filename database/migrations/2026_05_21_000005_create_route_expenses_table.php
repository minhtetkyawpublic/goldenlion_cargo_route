<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('category')->index();
            $table->string('description')->nullable();
            $table->decimal('amount', 14, 2);
            $table->string('currency', 3)->nullable();
            $table->timestamp('paid_at')->nullable()->index();
            $table->timestamps();

            $table->index(['route_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_expenses');
    }
};
