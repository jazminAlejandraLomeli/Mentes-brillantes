<?php

namespace App\Services\Content;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

trait ReordersRecords
{
    /**
     * Guarda el orden en que Liz acomodó los elementos (arrastrar y soltar).
     *
     * @param  class-string<Model>  $model
     * @param  list<int>  $ids
     */
    protected function applyOrder(string $model, array $ids): void
    {
        DB::transaction(function () use ($model, $ids): void {
            foreach (array_values($ids) as $position => $id) {
                $model::query()->whereKey($id)->update(['sort_order' => $position]);
            }
        });
    }
}
