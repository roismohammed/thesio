<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reference extends Model
{
    /**
     * The table associated with the model (avoids the SQL reserved word).
     *
     * @var string
     */
    protected $table = 'chapter_references';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'chapter_id',
        'type',
        'title',
        'authors',
        'year',
        'publication',
        'volume',
        'pages',
        'doi',
        'url',
        'file_path',
        'file_name',
        'mime',
        'size',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    /**
     * The chapter this reference belongs to.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}
