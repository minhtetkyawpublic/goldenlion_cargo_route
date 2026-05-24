<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\Repair;
use App\Models\RepairPart;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(): Response
    {
        $warehouse = $this->ensureDefaultWarehouse();

        $latestUnitCosts = StockMovement::query()
            ->where('warehouse_id', $warehouse->id)
            ->orderByDesc('moved_at')
            ->orderByDesc('id')
            ->get(['inventory_item_id', 'unit_cost'])
            ->groupBy('inventory_item_id')
            ->map(fn ($rows) => (float) ($rows->first()->unit_cost ?? 0));

        $latestRemarks = StockMovement::query()
            ->where('warehouse_id', $warehouse->id)
            ->orderByDesc('moved_at')
            ->orderByDesc('id')
            ->get(['inventory_item_id', 'notes'])
            ->groupBy('inventory_item_id')
            ->map(fn ($rows) => $rows->first()->notes);

        $stocks = WarehouseStock::query()
            ->with('item:id,sku,name,category,unit')
            ->where('warehouse_id', $warehouse->id)
            ->orderByDesc('quantity_on_hand')
            ->get()
            ->map(function (WarehouseStock $stock) use ($latestRemarks, $latestUnitCosts) {
                $unitCost = (float) ($latestUnitCosts[$stock->inventory_item_id] ?? 0);
                $quantity = (float) ($stock->quantity_on_hand ?? 0);

                return [
                    'id' => $stock->id,
                    'inventory_item_id' => $stock->inventory_item_id,
                    'sku' => $stock->item?->sku,
                    'name' => $stock->item?->name,
                    'category' => $stock->item?->category,
                    'unit' => $stock->item?->unit,
                    'remark' => $latestRemarks[$stock->inventory_item_id] ?? null,
                    'quantity_on_hand' => $quantity,
                    'unit_cost' => $unitCost,
                    'total_cost' => $quantity * $unitCost,
                ];
            })
            ->values();

        $items = InventoryItem::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'sku', 'name', 'category', 'unit'])
            ->map(fn (InventoryItem $item) => [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'category' => $item->category,
                'unit' => $item->unit,
            ]);

        $cars = Car::query()
            ->orderBy('plate_number')
            ->get(['id', 'plate_number', 'car_type']);

        $movementQuery = StockMovement::query()->where('warehouse_id', $warehouse->id);
        $stats = [
            'current_item_count' => $stocks->count(),
            'stock_in_total' => (float) (clone $movementQuery)->where('movement_type', 'in')->sum('quantity'),
            'stock_out_total' => (float) (clone $movementQuery)->where('movement_type', 'out')->sum('quantity'),
            'current_stock_value' => $stocks->sum('total_cost'),
        ];

        return Inertia::render('Stocks/Index', [
            'warehouse' => [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'location_name' => $warehouse->location?->name,
            ],
            'stats' => $stats,
            'stocks' => $stocks,
            'items' => $items,
            'cars' => $cars,
        ]);
    }

    public function history(Request $request): Response
    {
        $warehouse = $this->ensureDefaultWarehouse();
        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'movement_type' => ['nullable', 'in:in,out'],
        ]);

        $query = StockMovement::query()
            ->with([
                'item:id,name,category,unit',
                'car:id,plate_number,car_type',
            ])
            ->where('warehouse_id', $warehouse->id);

        if (!empty($filters['date_from'])) {
            $query->whereDate('moved_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('moved_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['movement_type'])) {
            $query->where('movement_type', $filters['movement_type']);
        }

        $transactions = $query
            ->orderByDesc('moved_at')
            ->orderByDesc('id')
            ->paginate(15, [
                'id',
                'warehouse_id',
                'inventory_item_id',
                'car_id',
                'movement_type',
                'quantity',
                'unit_cost',
                'total_cost',
                'moved_at',
                'notes',
            ])
            ->withQueryString()
            ->through(fn (StockMovement $movement) => $this->transformMovement($movement));

        return Inertia::render('Stocks/History', [
            'warehouse' => [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'location_name' => $warehouse->location?->name,
            ],
            'filters' => [
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
                'movement_type' => $filters['movement_type'] ?? '',
            ],
            'transactions' => $transactions,
        ]);
    }

    public function storeIn(Request $request): RedirectResponse
    {
        $warehouse = $this->ensureDefaultWarehouse();

        $validated = $request->validate([
            'inventory_item_id' => ['nullable', 'exists:inventory_items,id'],
            'item_name' => ['required_without:inventory_item_id', 'nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:50'],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'moved_at' => ['required', 'date'],
            'remark' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($warehouse, $validated): void {
            $item = $this->resolveItem($validated);

            $stock = WarehouseStock::query()->firstOrCreate(
                [
                    'warehouse_id' => $warehouse->id,
                    'inventory_item_id' => $item->id,
                ],
                [
                    'quantity_on_hand' => 0,
                ]
            );

            $quantity = (float) $validated['quantity'];
            $unitCost = (float) $validated['unit_cost'];
            $stock->quantity_on_hand = (float) $stock->quantity_on_hand + $quantity;
            $stock->save();

            StockMovement::create([
                'warehouse_id' => $warehouse->id,
                'inventory_item_id' => $item->id,
                'movement_type' => 'in',
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $quantity * $unitCost,
                'car_id' => null,
                'moved_at' => $validated['moved_at'],
                'notes' => $validated['remark'] ?? null,
            ]);
        });

        return back();
    }

    public function storeOut(Request $request): RedirectResponse
    {
        $warehouse = $this->ensureDefaultWarehouse();

        $validated = $request->validate([
            'inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'moved_at' => ['required', 'date'],
            'car_id' => ['nullable', 'exists:cars,id'],
            'remark' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($warehouse, $validated): void {
            $item = InventoryItem::query()->findOrFail($validated['inventory_item_id']);
            $stock = WarehouseStock::query()->firstOrCreate(
                [
                    'warehouse_id' => $warehouse->id,
                    'inventory_item_id' => $item->id,
                ],
                [
                    'quantity_on_hand' => 0,
                ]
            );

            $quantity = (float) $validated['quantity'];
            $unitCost = (float) $validated['unit_cost'];
            $currentQuantity = (float) $stock->quantity_on_hand;

            if ($currentQuantity < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => 'Not enough stock in warehouse for this item.',
                ]);
            }

            $stock->quantity_on_hand = $currentQuantity - $quantity;
            $stock->save();

            $repairId = null;
            if (!empty($validated['car_id'])) {
                $repair = Repair::query()->create([
                    'car_id' => $validated['car_id'],
                    'route_id' => null,
                    'repair_type' => $item->name,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'total_cost' => $quantity * $unitCost,
                    'remark' => $validated['remark'] ?? 'Warehouse stock out for repair.',
                    'status' => 'done',
                    'repaired_on' => $validated['moved_at'],
                    'description' => $validated['remark'] ?? 'Warehouse stock out for repair.',
                    'labor_cost' => $quantity * $unitCost,
                    'currency' => 'MMK',
                ]);

                RepairPart::query()->create([
                    'repair_id' => $repair->id,
                    'inventory_item_id' => $item->id,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'total_cost' => $quantity * $unitCost,
                    'currency' => 'MMK',
                ]);

                $repairId = $repair->id;
            }

            StockMovement::create([
                'warehouse_id' => $warehouse->id,
                'inventory_item_id' => $item->id,
                'movement_type' => 'out',
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $quantity * $unitCost,
                'car_id' => $validated['car_id'] ?? null,
                'reference_type' => $repairId ? Repair::class : null,
                'reference_id' => $repairId,
                'moved_at' => $validated['moved_at'],
                'notes' => $validated['remark'] ?? null,
            ]);
        });

        return back();
    }

    public function updateStock(Request $request, WarehouseStock $stock): RedirectResponse
    {
        $warehouse = $this->ensureDefaultWarehouse();
        if ((int) $stock->warehouse_id !== (int) $warehouse->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:50'],
            'quantity_on_hand' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($stock, $validated): void {
            $stock->loadMissing('item');

            $stock->item?->update([
                'name' => trim((string) $validated['name']),
                'category' => $validated['category'] ?? null,
                'unit' => $validated['unit'] ?? null,
            ]);

            $stock->update([
                'quantity_on_hand' => (float) $validated['quantity_on_hand'],
            ]);
        });

        return back();
    }

    public function destroyMovement(Request $request, StockMovement $movement): RedirectResponse
    {
        $warehouse = $this->ensureDefaultWarehouse();
        if ((int) $movement->warehouse_id !== (int) $warehouse->id) {
            abort(404);
        }

        DB::transaction(function () use ($movement): void {
            $stock = WarehouseStock::query()->firstOrCreate(
                [
                    'warehouse_id' => $movement->warehouse_id,
                    'inventory_item_id' => $movement->inventory_item_id,
                ],
                [
                    'quantity_on_hand' => 0,
                ]
            );

            $quantity = (float) ($movement->quantity ?? 0);
            $currentQuantity = (float) ($stock->quantity_on_hand ?? 0);

            if ($movement->movement_type === 'in') {
                if ($currentQuantity < $quantity) {
                    throw ValidationException::withMessages([
                        'transaction' => 'This stock-in transaction cannot be deleted because the quantity has already been used.',
                    ]);
                }

                $stock->update([
                    'quantity_on_hand' => $currentQuantity - $quantity,
                ]);
            } else {
                $stock->update([
                    'quantity_on_hand' => $currentQuantity + $quantity,
                ]);

                if ($movement->reference_type === Repair::class && $movement->reference_id) {
                    Repair::query()->whereKey($movement->reference_id)->delete();
                }
            }

            $movement->delete();
        });

        return back();
    }

    private function ensureDefaultWarehouse(): Warehouse
    {
        $warehouse = Warehouse::query()->with('location:id,name')->orderBy('id')->first();
        if ($warehouse) {
            return $warehouse;
        }

        $mainLocationId = Location::query()
            ->where('type', 'main')
            ->orderBy('id')
            ->value('id');

        return Warehouse::query()->create([
            'name' => 'Main Warehouse',
            'location_id' => $mainLocationId,
        ])->load('location:id,name');
    }

    private function resolveItem(array $validated): InventoryItem
    {
        if (!empty($validated['inventory_item_id'])) {
            return InventoryItem::query()->findOrFail($validated['inventory_item_id']);
        }

        $name = trim((string) ($validated['item_name'] ?? ''));
        $existing = InventoryItem::query()->whereRaw('lower(name) = ?', [Str::lower($name)])->first();
        if ($existing) {
            return $existing;
        }

        return InventoryItem::query()->create([
            'sku' => $this->generateSku($name),
            'name' => $name,
            'category' => $validated['category'] ?? null,
            'unit' => $validated['unit'] ?? null,
            'is_active' => true,
        ]);
    }

    private function generateSku(string $name): string
    {
        $base = Str::upper(Str::substr(preg_replace('/[^A-Za-z0-9]/', '', $name) ?: 'ITEM', 0, 8));

        do {
            $sku = $base.'-'.Str::upper(Str::random(4));
        } while (InventoryItem::query()->where('sku', $sku)->exists());

        return $sku;
    }

    private function transformMovement(StockMovement $movement): array
    {
        return [
            'id' => $movement->id,
            'movement_type' => $movement->movement_type,
            'item_name' => $movement->item?->name,
            'item_category' => $movement->item?->category,
            'unit' => $movement->item?->unit,
            'quantity' => (float) ($movement->quantity ?? 0),
            'unit_cost' => (float) ($movement->unit_cost ?? 0),
            'total_cost' => (float) ($movement->total_cost ?? 0),
            'moved_at' => optional($movement->moved_at)->format('Y-m-d'),
            'car' => $movement->car ? [
                'id' => $movement->car->id,
                'plate_number' => $movement->car->plate_number,
                'car_type' => $movement->car->car_type,
            ] : null,
            'notes' => $movement->notes,
        ];
    }
}
