<?php

namespace App\Models;

use App\Scopes\OwnedByUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupervisionGuide extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'thesis_id',
        'origin',
        'status',
        'is_tailored',
        'generated_at',
    ];

    /**
     * The "booted" method of the model. Ownership resolves through the
     * thesis's user_id, matching the Chapter scope.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new OwnedByUserScope('thesis.user_id'));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_tailored' => 'boolean',
            'generated_at' => 'datetime',
        ];
    }

    /**
     * The thesis this guide belongs to.
     */
    public function thesis(): BelongsTo
    {
        return $this->belongsTo(Thesis::class);
    }

    /**
     * The discussion points of this guide, most urgent first.
     */
    public function points(): HasMany
    {
        return $this->hasMany(GuidancePoint::class)->orderBy('priority');
    }

    /**
     * Mark the guide as tailored (student edited its points).
     */
    public function markTailored(): void
    {
        $this->is_tailored = true;
        $this->save();
    }
}
