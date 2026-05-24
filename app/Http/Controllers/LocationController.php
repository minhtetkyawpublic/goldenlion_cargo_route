<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Location;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(): Response
    {
        $search = request()->string('search')->toString();

        $locations = Location::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('type', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Locations/Index', [
            'filters' => [
                'search' => $search,
            ],
            'locations' => $locations->through(fn (Location $location) => [
                'id' => $location->id,
                'name' => $location->name,
                'type' => $location->type,
                'address' => $location->address,
                'phone_numbers' => $location->phone_numbers,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['main', 'destination'])],
            'address' => ['nullable', 'string', 'max:255'],
            'phone_numbers' => ['nullable', 'array'],
            'phone_numbers.*' => ['nullable', 'string', 'max:50'],
        ]);

        Location::create($validated);

        return redirect('/locations');
    }

    public function update(Location $location, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['main', 'destination'])],
            'address' => ['nullable', 'string', 'max:255'],
            'phone_numbers' => ['nullable', 'array'],
            'phone_numbers.*' => ['nullable', 'string', 'max:50'],
        ]);

        $location->update($validated);

        return redirect('/locations');
    }

    public function destroy(Location $location): RedirectResponse
    {
        $relatedRecords = [];

        if ($location->originRoutes()->exists() || $location->destinationRoutes()->exists()) {
            $relatedRecords[] = 'routes';
        }

        if ($location->legsFromHere()->exists() || $location->legsToHere()->exists()) {
            $relatedRecords[] = 'route legs';
        }

        if ($location->warehouses()->exists()) {
            $relatedRecords[] = 'warehouses';
        }

        if (Car::query()->where('current_location_id', $location->id)->exists()) {
            $relatedRecords[] = 'cars';
        }

        if (!empty($relatedRecords)) {
            throw ValidationException::withMessages([
                'delete' => 'This location has related '.implode(' and ', $relatedRecords).'. Please delete those records first.',
            ]);
        }

        $location->delete();

        return redirect('/locations');
    }
}
