<?php

namespace App\Models;

use App\Scopes\OwnedByUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
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
        'status',
        'priority',
        'position',
        'due_at',
        'due_at_mode',
        'origin',
        'chapter_id',
        'supervision_note_id',
        'task_suggestion_id',
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
            'position' => 'integer',
            'due_at' => 'datetime',
        ];
    }

    /**
     * The thesis this task belongs to.
     */
    public function thesis(): BelongsTo
    {
        return $this->belongsTo(Thesis::class);
    }

    /**
     * The related chapter (optional).
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * The supervision note this task derives from (optional).
     */
    public function supervisionNote(): BelongsTo
    {
        return $this->belongsTo(SupervisionNote::class);
    }

    /**
     * The task suggestion this task was accepted from (optional).
     */
    public function taskSuggestion(): BelongsTo
    {
        return $this->belongsTo(TaskSuggestion::class);
    }

    /**
     * Whether the task is completed.
     */
    public function isDone(): bool
    {
        return $this->status === 'done';
    }
}