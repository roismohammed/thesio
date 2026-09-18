<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paraphrase extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'chapter_id',
        'user_id',
        'supervision_note_id',
        'original_selection',
        'custom_instruction',
        'reference_context',
        'style_mode',
        'paraphrased_text',
        'outcome',
        'applied_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'applied_at' => 'datetime',
        ];
    }

    /**
     * The chapter this paraphrase belongs to.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * The supervision note referenced if any.
     */
    public function supervisionNote(): BelongsTo
    {
        return $this->belongsTo(SupervisionNote::class);
    }

    /**
     * The requester.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
