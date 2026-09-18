<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use League\HTMLToMarkdown\HtmlConverter;
use PhpOffice\PhpWord\IOFactory as WordIOFactory;
use Smalot\PdfParser\Parser as PdfParser;
use Symfony\Component\Process\Process;

/**
 * Converts an uploaded chapter document (PDF/Word) to Markdown.
 *
 * Primary path: pandoc (system binary) for high-fidelity structure.
 * Fallback path: pure-PHP (pdfparser / phpword + html-to-markdown) when
 * pandoc is unavailable (research D1).
 */
class MarkdownConverter
{
    /**
     * Convert a stored file (disk path) to Markdown.
     *
     * @return array{markdown: string|null, status: string, message: string|null}
     */
    public function convert(string $diskPath, string $mime): array
    {
        $absolutePath = Storage::disk('local')->path($diskPath);

        if (! is_file($absolutePath)) {
            return ['markdown' => null, 'status' => 'failed', 'message' => 'Berkas tidak ditemukan.'];
        }

        if ($this->pandocAvailable()) {
            $result = $this->convertWithPandoc($absolutePath);
            if ($result['status'] === 'succeeded') {
                return $result;
            }
        }

        return $this->convertWithPhpFallback($absolutePath, $mime);
    }

    /**
     * Try pandoc first.
     *
     * @return array{markdown: string|null, status: string, message: string|null}
     */
    private function convertWithPandoc(string $absolutePath): array
    {
        try {
            $process = new Process([
                'pandoc',
                $absolutePath,
                '--from=docx+markdown',
                '--to=markdown',
                '--wrap=none',
                '--markdown-headings=atx',
            ]);
            $process->setTimeout(60);
            $process->run();

            if (! $process->isSuccessful()) {
                return ['markdown' => null, 'status' => 'failed', 'message' => 'Pandoc gagal mengonversi dokumen.'];
            }

            $markdown = trim($process->getOutput());
            if ($markdown === '') {
                return ['markdown' => null, 'status' => 'failed', 'message' => 'Dokumen kosong atau hanya berisi gambar.'];
            }

            return ['markdown' => $markdown, 'status' => 'succeeded', 'message' => null];
        } catch (\Throwable) {
            return ['markdown' => null, 'status' => 'failed', 'message' => 'Pandoc tidak dapat dijalankan.'];
        }
    }

    /**
     * Pure-PHP fallback.
     *
     * @return array{markdown: string|null, status: string, message: string|null}
     */
    private function convertWithPhpFallback(string $absolutePath, string $mime): array
    {
        try {
            $lowerPath = strtolower($absolutePath);
            if ($mime === 'text/markdown' || str_ends_with($lowerPath, '.md')) {
                $markdown = trim((string) file_get_contents($absolutePath));

                return [
                    'markdown' => $markdown !== '' ? $markdown : null,
                    'status' => $markdown !== '' ? 'succeeded' : 'failed',
                    'message' => $markdown !== '' ? null : 'Dokumen kosong.',
                ];
            }

            if ($mime === 'text/plain' || str_ends_with($lowerPath, '.txt')) {
                $content = trim((string) file_get_contents($absolutePath));

                return [
                    'markdown' => $content !== '' ? $content : null,
                    'status' => $content !== '' ? 'succeeded' : 'failed',
                    'message' => $content !== '' ? null : 'Dokumen kosong.',
                ];
            }

            $html = $this->extractHtml($absolutePath, $mime);
            $converter = new HtmlConverter([
                'strip_tags' => true,
                'hard_break' => true,
            ]);
            $markdown = trim($converter->convert($html));

            if ($markdown === '') {
                return ['markdown' => null, 'status' => 'failed', 'message' => 'Dokumen kosong atau hanya berisi gambar.'];
            }

            return ['markdown' => $markdown, 'status' => 'succeeded', 'message' => null];
        } catch (\Throwable $e) {
            return ['markdown' => null, 'status' => 'failed', 'message' => 'Tidak dapat membaca isi dokumen: '.$e->getMessage()];
        }
    }

    /**
     * Extract readable HTML/text from a PDF or Word document.
     */
    private function extractHtml(string $absolutePath, string $mime): string
    {
        $isPdf = $mime === 'application/pdf' || str_ends_with(strtolower($absolutePath), '.pdf');

        if ($isPdf) {
            $parser = new PdfParser;
            $pdf = $parser->parseFile($absolutePath);

            return nl2br(e($pdf->getText()));
        }

        $phpWord = WordIOFactory::load($absolutePath);
        $writer = WordIOFactory::createWriter($phpWord, 'HTML');

        $tempFile = tempnam(sys_get_temp_dir(), 'thesio-docx').'.html';
        $writer->save($tempFile);
        $html = (string) file_get_contents($tempFile);
        @unlink($tempFile);

        return $html;
    }

    /**
     * Whether the pandoc binary is available on the host.
     */
    private function pandocAvailable(): bool
    {
        try {
            $process = new Process(['pandoc', '--version']);
            $process->run();

            return $process->isSuccessful();
        } catch (\Throwable) {
            return false;
        }
    }
}
