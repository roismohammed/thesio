<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

/**
 * Reusable global scope restricting a model to the authenticated user's own
 * rows. Apply to Thesis (via `user_id`) or Chapter (via `thesis.user_id`).
 */
class OwnedByUserScope implements Scope
{
    /**
     * The column (or relation column) used for the ownership filter.
     */
    public function __construct(
        protected string $column = 'user_id',
    ) {}

    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $userId = Auth::id();

        if ($userId === null) {
            $builder->whereRaw('0 = 1');

            return;
        }

        if ($this->column === 'thesis.user_id') {
            $builder->whereHas('thesis', function (Builder $q) use ($userId): void {
                $q->where('user_id', $userId);
            });

            return;
        }

        $builder->where($this->column, $userId);
    }
}
