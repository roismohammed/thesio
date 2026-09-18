<?php

namespace App\Actions\Thesis;

use App\Models\Reference;

class UpdateReferenceAction
{
    /**
     * Update a reference's title/url.
     *
     * @param  array{title?: string, url?: string|null}  $data
     */
    public function execute(Reference $reference, array $data): Reference
    {
        $reference->fill([
            'title' => $data['title'] ?? $reference->title,
            'authors' => array_key_exists('authors', $data) ? $data['authors'] : $reference->authors,
            'year' => array_key_exists('year', $data) ? $data['year'] : $reference->year,
            'publication' => array_key_exists('publication', $data) ? $data['publication'] : $reference->publication,
            'volume' => array_key_exists('volume', $data) ? $data['volume'] : $reference->volume,
            'pages' => array_key_exists('pages', $data) ? $data['pages'] : $reference->pages,
            'doi' => array_key_exists('doi', $data) ? $data['doi'] : $reference->doi,
        ]);

        if ($reference->type === 'link' && array_key_exists('url', $data)) {
            $reference->url = $data['url'];
        }

        $reference->save();

        return $reference;
    }
}
