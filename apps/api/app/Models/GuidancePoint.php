<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuidancePoint extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'supervision_guide_id',
        'origin',
        'title',
        'description',
        'status',
        'priority',
        'chapter_id',
        'supervision_note_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'priority' => 'integer',
        ];
    }

    /**
     * The guide this point belongs to.
     */
    public function supervisionGuide(): BelongsTo
    {
        return $this->belongsTo(SupervisionGuide::class);
    }

    /**
     * The optional source chapter this point references.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * The optional source notulen this point references.
     */
    public function supervisionNote(): BelongsTo
    {
        return $this->belongsTo(SupervisionNote::class);
    }
}
