<?php

namespace App\Services;

use App\Models\Location;
use App\Services\Content\ReordersRecords;

/**
 * Alta, edición, orden y baja de sucursales.
 */
class LocationService
{
    use ReordersRecords;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Location
    {
        return Location::create([
            ...$data,
            'sort_order' => (int) Location::max('sort_order') + 1,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Location $location, array $data): Location
    {
        $location->update($data);

        return $location;
    }

    public function toggle(Location $location): Location
    {
        $location->update(['is_active' => ! $location->is_active]);

        return $location;
    }

    public function delete(Location $location): void
    {
        $location->delete();
    }

    /**
     * @param  list<int>  $ids
     */
    public function reorder(array $ids): void
    {
        $this->applyOrder(Location::class, $ids);
    }
}
