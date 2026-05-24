<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CargoRoute extends Model
{
    use HasFactory;

    protected $table = 'routes';

    protected $fillable = [
        'car_id',
        'origin_location_id',
        'destination_location_id',
        'status',
        'started_at',
        'ended_at',
        'distance_km',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'distance_km' => 'decimal:3',
        ];
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class, 'car_id');
    }

    public function originLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'origin_location_id');
    }

    public function destinationLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'destination_location_id');
    }

    public function legs(): HasMany
    {
        return $this->hasMany(RouteLeg::class, 'route_id')->orderBy('sequence');
    }

    public function cargos(): HasMany
    {
        return $this->hasMany(RouteCargo::class, 'route_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(RouteExpense::class, 'route_id');
    }

    public function repairs(): HasMany
    {
        return $this->hasMany(Repair::class, 'route_id');
    }
}
