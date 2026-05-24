<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Repair extends Model
{
    use HasFactory;

    protected $fillable = [
        'car_id',
        'route_id',
        'repair_type',
        'quantity',
        'unit_cost',
        'total_cost',
        'remark',
        'status',
        'repaired_on',
        'odometer_km',
        'vendor',
        'description',
        'labor_cost',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'repaired_on' => 'date',
            'quantity' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'odometer_km' => 'integer',
            'labor_cost' => 'decimal:2',
        ];
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class, 'car_id');
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(CargoRoute::class, 'route_id');
    }

    public function parts(): HasMany
    {
        return $this->hasMany(RepairPart::class, 'repair_id');
    }
}
