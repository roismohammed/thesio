<?php

namespace App\Models;

use App\Scopes\OwnedByUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Chapter extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'thesis_id',
        'title',
        'position',
        'status',
        'current_version_id',
    ];

    /**
     * The "booted" method of the model.
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
            'position' => 'integer',
            'status' => 'string',
            'current_version_id' => 'integer',
        ];
    }

    /**
     * The thesis this chapter belongs to.
     */
    public function thesis(): BelongsTo
    {
        return $this->belongsTo(Thesis::class);
    }

    /**
     * All versions of this chapter.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ChapterVersion::class)->orderByDesc('version_number');
    }

    /**
     * The active version pointer.
     */
    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(ChapterVersion::class, 'current_version_id');
    }

    /**
     * References attached to this chapter.
     */
    public function references(): HasMany
    {
        return $this->hasMany(Reference::class);
    }

    /**
     * The supervision note (1:1).
     */
    public function supervisionNote(): HasOne
    {
        return $this->hasOne(SupervisionNote::class);
    }

    /**
     * Paraphrase requests for this chapter.
     */
    public function paraphrases(): HasMany
    {
        return $this->hasMany(Paraphrase::class);
    }

    /**
     * Annotations, highlights, and comments on this chapter.
     */
    public function annotations(): HasMany
    {
        return $this->hasMany(ChapterAnnotation::class)->orderByDesc('created_at');
    }
}
