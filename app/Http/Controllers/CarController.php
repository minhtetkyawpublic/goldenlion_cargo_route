<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Repair;
use App\Models\RouteCargo;
use App\Models\RouteExpense;
use App\Models\StockMovement;
use App\Models\WarehouseStock;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CarController extends Controller
{
    public function index(): Response
    {
        $search = request()->string('search')->toString();

        $cars = Car::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('plate_number', 'like', "%{$search}%")
                        ->orWhere('car_type', 'like', "%{$search}%")
                        ->orWhere('driver_name', 'like', "%{$search}%")
                        ->orWhere('remark', 'like', "%{$search}%");
                });
            })
            ->orderBy('plate_number')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Cars/Index', [
            'filters' => [
                'search' => $search,
            ],
            'cars' => $cars->through(fn (Car $car) => [
                'id' => $car->id,
                'plate_number' => $car->plate_number,
                'car_type' => $car->car_type,
                'driver_name' => $car->driver_name,
                'remark' => $car->remark,
                'is_active' => $car->is_active,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plate_number' => ['required', 'string', 'max:50', 'unique:cars,plate_number'],
            'car_type' => ['required', 'string', 'max:100'],
            'driver_name' => ['required', 'string', 'max:100'],
            'remark' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        Car::create([
            ...$validated,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect('/cars');
    }

    public function show(Request $request, Car $car): Response
    {
        $filters = $request->validate([
            'from_date' => ['nullable', 'date'],
            'to_date' => ['nullable', 'date', 'after_or_equal:from_date'],
        ]);

        $routeQuery = $car->routes()
            ->with([
                'originLocation:id,name',
                'destinationLocation:id,name',
            ])
            ->withSum('cargos as cargo_total', 'total_price')
            ->withSum('expenses as expense_total', 'amount')
            ->orderByDesc('started_at')
            ->orderByDesc('id');

        $repairQuery = $car->repairs()
            ->orderByDesc('repaired_on')
            ->orderByDesc('id');

        $this->applyDateFilter($routeQuery, 'started_at', $filters['from_date'] ?? null, $filters['to_date'] ?? null);
        $this->applyDateFilter($repairQuery, 'repaired_on', $filters['from_date'] ?? null, $filters['to_date'] ?? null);

        $routes = $routeQuery
            ->paginate(
                10,
                [
                    'id',
                    'car_id',
                    'origin_location_id',
                    'destination_location_id',
                    'status',
                    'started_at',
                    'ended_at',
                    'notes',
                ],
                'routes_page'
            )
            ->withQueryString()
            ->through(fn ($route) => [
                'id' => $route->id,
                'car_id' => $route->car_id,
                'origin_location_id' => $route->origin_location_id,
                'destination_location_id' => $route->destination_location_id,
                'status' => $route->status,
                'started_at' => $route->started_at,
                'ended_at' => $route->ended_at,
                'notes' => $route->notes,
                'origin_location' => $route->originLocation,
                'destination_location' => $route->destinationLocation,
                'cargo_total' => $route->cargo_total,
                'expense_total' => $route->expense_total,
            ]);

        $repairs = $repairQuery
            ->paginate(
                10,
                [
                    'id',
                    'car_id',
                    'repair_type',
                    'quantity',
                    'unit_cost',
                    'total_cost',
                    'remark',
                    'repaired_on',
                    'created_at',
                    'labor_cost',
                    'description',
                ],
                'repairs_page'
            )
            ->withQueryString()
            ->through(function (Repair $repair) {
                $totalCost = (float) ($repair->total_cost ?? 0);
                if ($totalCost <= 0) {
                    $totalCost = (float) ($repair->labor_cost ?? 0);
                }

                return [
                    'id' => $repair->id,
                    'repair_type' => $repair->repair_type,
                    'quantity' => $repair->quantity,
                    'unit_cost' => $repair->unit_cost,
                    'total_cost' => $totalCost,
                    'remark' => $repair->remark ?: $repair->description,
                    'repaired_on' => optional($repair->repaired_on)->format('Y-m-d'),
                    'created_at' => optional($repair->created_at)->format('Y-m-d H:i:s'),
                ];
            });

        $filteredRoutesCount = (clone $routeQuery)->count();
        $filteredRepairsCount = (clone $repairQuery)->count();

        $routeDateFilter = function ($query) use ($car, $filters): void {
            $query->where('car_id', $car->id);

            if (!empty($filters['from_date'])) {
                $query->whereDate('started_at', '>=', $filters['from_date']);
            }

            if (!empty($filters['to_date'])) {
                $query->whereDate('started_at', '<=', $filters['to_date']);
            }
        };

        $cargoIncomeTotal = (float) RouteCargo::query()
            ->whereHas('route', $routeDateFilter)
            ->sum('total_price');

        $routeExpenseTotal = (float) RouteExpense::query()
            ->whereHas('route', $routeDateFilter)
            ->sum('amount');

        $repairExpenseTotal = (float) (clone $repairQuery)->sum(DB::raw('COALESCE(NULLIF(total_cost, 0), labor_cost, 0)'));

        $routeProfitTotal = $cargoIncomeTotal - $routeExpenseTotal;

        return Inertia::render('Cars/Show', [
            'car' => $car->only(['id', 'plate_number', 'car_type', 'driver_name', 'remark', 'is_active', 'created_at']),
            'filters' => [
                'from_date' => $filters['from_date'] ?? '',
                'to_date' => $filters['to_date'] ?? '',
            ],
            'stats' => [
                'routes_count' => $car->routes()->count(),
                'repairs_count' => $car->repairs()->count(),
                'filtered_routes_count' => $filteredRoutesCount,
                'filtered_repairs_count' => $filteredRepairsCount,
                'route_profit_total' => $routeProfitTotal,
                'repair_expense_total' => $repairExpenseTotal,
                'net_profit' => $routeProfitTotal - $repairExpenseTotal,
            ],
            'routes' => $routes,
            'repairs' => $repairs,
        ]);
    }

    public function storeRepair(Car $car, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'repair_type' => ['required', 'string', 'max:100'],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'remark' => ['nullable', 'string', 'max:500'],
            'repaired_on' => ['required', 'date'],
        ]);

        $quantity = (float) $validated['quantity'];
        $unitCost = (float) $validated['unit_cost'];
        $totalCost = $quantity * $unitCost;

        $car->repairs()->create([
            'repair_type' => $validated['repair_type'],
            'quantity' => $quantity,
            'unit_cost' => $unitCost,
            'total_cost' => $totalCost,
            'remark' => $validated['remark'] ?? null,
            'description' => $validated['remark'] ?? null,
            'repaired_on' => $validated['repaired_on'],
            'labor_cost' => $totalCost,
            'currency' => 'MMK',
            'status' => 'done',
        ]);

        return back();
    }

    public function destroyRepair(Car $car, Repair $repair): RedirectResponse
    {
        if ((int) $repair->car_id !== (int) $car->id) {
            abort(404);
        }

        DB::transaction(function () use ($repair): void {
            $linkedMovements = StockMovement::query()
                ->where('reference_type', Repair::class)
                ->where('reference_id', $repair->id)
                ->get();

            foreach ($linkedMovements as $movement) {
                $stock = WarehouseStock::query()->firstOrCreate(
                    [
                        'warehouse_id' => $movement->warehouse_id,
                        'inventory_item_id' => $movement->inventory_item_id,
                    ],
                    [
                        'quantity_on_hand' => 0,
                    ]
                );

                $stock->update([
                    'quantity_on_hand' => (float) ($stock->quantity_on_hand ?? 0) + (float) ($movement->quantity ?? 0),
                ]);

                $movement->delete();
            }

            $repair->delete();
        });

        return back();
    }

    public function update(Car $car, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plate_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('cars', 'plate_number')->ignore($car->id),
            ],
            'car_type' => ['required', 'string', 'max:100'],
            'driver_name' => ['required', 'string', 'max:100'],
            'remark' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $car->update([
            ...$validated,
            'is_active' => (bool) ($validated['is_active'] ?? true),
        ]);

        return redirect('/cars');
    }

    public function destroy(Car $car): RedirectResponse
    {
        $relatedRecords = [];

        if ($car->routes()->exists()) {
            $relatedRecords[] = 'routes';
        }

        if ($car->repairs()->exists()) {
            $relatedRecords[] = 'repair costs';
        }

        if (StockMovement::query()->where('car_id', $car->id)->exists()) {
            $relatedRecords[] = 'stock transactions';
        }

        if (!empty($relatedRecords)) {
            throw ValidationException::withMessages([
                'delete' => 'This car has related '.implode(', ', $relatedRecords).'. Please delete related records and transactions first.',
            ]);
        }

        $car->delete();

        return redirect('/cars');
    }

    private function applyDateFilter(Relation $query, string $column, ?string $fromDate, ?string $toDate): void
    {
        if ($fromDate) {
            $query->whereDate($column, '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate($column, '<=', $toDate);
        }
    }
}
