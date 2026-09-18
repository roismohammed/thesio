<?php

namespace App\Actions\Thesis;

use App\Models\Reference;
use Illuminate\Http\UploadedFile;

class CreateReferenceAction
{
    /**
     * Create a link- or file-type reference for a chapter.
     *
     * @param  array{type: string, title: string, url?: string|null}  $data
     */
    public function execute(int $chapterId, array $data, ?UploadedFile $file = null): Reference
    {
        $reference = Reference::create([
            'chapter_id' => $chapterId,
            'type' => $data['type'],
            'title' => $data['title'],
            'authors' => $data['authors'] ?? null,
            'year' => $data['year'] ?? null,
            'publication' => $data['publication'] ?? null,
            'volume' => $data['volume'] ?? null,
            'pages' => $data['pages'] ?? null,
            'doi' => $data['doi'] ?? null,
            'url' => $data['type'] === 'link' ? ($data['url'] ?? null) : null,
        ]);

        if ($file) {
            $reference->update([
                'file_path' => $file->store('thesis/references/'.$chapterId, 'local'),
                'file_name' => $file->getClientOriginalName(),
                'mime' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
            $reference->refresh();
        }

        return $reference;
    }
}
