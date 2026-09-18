<?php

namespace App\Actions\Thesis;

use App\Models\Reference;
use Illuminate\Support\Facades\Storage;

class DeleteReferenceAction
{
    /**
     * Delete a reference; file-type references remove the stored file.
     */
    public function execute(Reference $reference): void
    {
        if ($reference->file_path) {
            Storage::disk('local')->delete($reference->file_path);
        }

        $reference->delete();
    }
}
