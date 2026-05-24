<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RouteLeg extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'sequence',
        'direction',
        'from_location_id',
        'to_location_id',
        'started_at',
        'ended_at',
        'distance_km',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'sequence' => 'integer',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'distance_km' => 'decimal:3',
        ];
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(CargoRoute::class, 'route_id');
    }

    public function fromLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function toLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }

    public function cargos(): HasMany
    {
        return $this->hasMany(RouteCargo::class, 'route_leg_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(RouteExpense::class, 'route_leg_id');
    }
}
