<?php

namespace App\Jobs\Thesis;

use App\Models\ChapterVersion;
use App\Support\MarkdownConverter;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ConvertChapterToMarkdownJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public int $tries = 1;

    public int $timeout = 180;

    public function __construct(
        public ChapterVersion $version,
    ) {}

    /**
     * Convert the stored original to Markdown and record the outcome.
     */
    public function handle(MarkdownConverter $converter): void
    {
        $result = $converter->convert($this->version->original_file_path, $this->version->mime);

        $this->version->markdown_content = $result['markdown'];
        $this->version->conversion_status = $result['status'];
        $this->version->conversion_message = $result['message'];
        $this->version->save();
    }
}
