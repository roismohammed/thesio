<?php

namespace App\Models;

use App\Scopes\OwnedByUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TaskSuggestion extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'thesis_id',
        'title',
        'description',
        'priority',
        'source_type',
        'chapter_id',
        'supervision_note_id',
        'signature',
        'status',
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
            'priority' => 'integer',
            'generated_at' => 'datetime',
        ];
    }

    /**
     * The thesis this suggestion belongs to.
     */
    public function thesis(): BelongsTo
    {
        return $this->belongsTo(Thesis::class);
    }

    /**
     * The related chapter source (optional).
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * The supervision note source (optional).
     */
    public function supervisionNote(): BelongsTo
    {
        return $this->belongsTo(SupervisionNote::class);
    }

    /**
     * The task created when this suggestion was accepted (optional).
     */
    public function task(): HasOne
    {
        return $this->hasOne(Task::class, 'task_suggestion_id');
    }

    /**
     * Deterministic dedup hash for a suggestion: source type + source id +
     * normalized title. Rejected suggestions keep their row so a matching
     * suggestion never reappears (research D9).
     */
    public static function signatureFor(string $sourceType, ?int $sourceId, string $title): string
    {
        return sha1(strtolower(trim($sourceType)).'|'.($sourceId ?? 'null').'|'.strtolower(trim($title)));
    }
}