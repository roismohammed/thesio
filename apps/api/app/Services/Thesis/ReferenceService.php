<?php

namespace App\Services\Thesis;

use App\Actions\Thesis\CreateReferenceAction;
use App\Actions\Thesis\DeleteReferenceAction;
use App\Actions\Thesis\UpdateReferenceAction;
use App\Models\Chapter;
use App\Models\Reference;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReferenceService
{
    public function __construct(
        private readonly CreateReferenceAction $createReferenceAction,
        private readonly UpdateReferenceAction $updateReferenceAction,
        private readonly DeleteReferenceAction $deleteReferenceAction,
    ) {}

    /**
     * List a chapter's references.
     *
     * @return Collection<int, Reference>
     */
    public function list(Chapter $chapter): Collection
    {
        return $chapter->references()->get();
    }

    /**
     * @param  array{type: string, title: string, url?: string|null}  $data
     */
    public function create(Chapter $chapter, array $data, ?UploadedFile $file = null): Reference
    {
        $reference = $this->createReferenceAction->execute($chapter->id, $data, $file);

        $label = $reference->type === 'link' ? $reference->url : $reference->file_name;
        activity('thesis')
            ->performedOn($chapter)
            ->causedBy(request()->user())
            ->log("Menambahkan referensi '{$reference->title}' ({$label}) pada bab '{$chapter->title}'.");

        return $reference;
    }

    /**
     * @param  array{title?: string, url?: string|null}  $data
     */
    public function update(Reference $reference, array $data): Reference
    {
        $reference = $this->updateReferenceAction->execute($reference, $data);

        activity('thesis')
            ->performedOn($reference)
            ->causedBy(request()->user())
            ->log("Memperbarui referensi '{$reference->title}'.");

        return $reference;
    }

    public function delete(Reference $reference): void
    {
        activity('thesis')
            ->performedOn($reference)
            ->causedBy(request()->user())
            ->log("Menghapus referensi '{$reference->title}'.");

        $this->deleteReferenceAction->execute($reference);
    }

    /**
     * Stream a file-type reference's stored file.
     */
    public function download(Reference $reference): StreamedResponse
    {
        return response()->streamDownload(
            function () use ($reference): void {
                echo Storage::disk('local')->get($reference->file_path);
            },
            $reference->file_name,
            ['Content-Type' => $reference->mime],
        );
    }
}
