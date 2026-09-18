<?php

namespace App\Models;

use App\Scopes\OwnedByUserScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Thesis extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'status',
        'defense_deadline_at',
        'guidance_last_viewed_at',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new OwnedByUserScope('user_id'));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => 'string',
            'defense_deadline_at' => 'datetime',
            'guidance_last_viewed_at' => 'datetime',
        ];
    }

    /**
     * The owning student.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * All chapters under this thesis.
     */
    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class)->orderBy('position');
    }

    /**
     * All supervision guides for this thesis, newest first.
     */
    public function supervisionGuides(): HasMany
    {
        return $this->hasMany(SupervisionGuide::class)->orderByDesc('generated_at');
    }

    /**
     * All tasks on the thesis board, ordered for display.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class)->orderBy('status')->orderBy('position');
    }

    /**
     * All milestones for this thesis, ordered chronologically.
     */
    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class)->orderBy('position');
    }

    /**
     * All AI task suggestions for this thesis.
     */
    public function taskSuggestions(): HasMany
    {
        return $this->hasMany(TaskSuggestion::class);
    }
}
