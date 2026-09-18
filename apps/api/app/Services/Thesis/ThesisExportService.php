<?php

namespace App\Services\Thesis;

use App\Models\Thesis;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\Style\Font;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ThesisExportService
{
    /**
     * Export complete compiled thesis to DOCX document.
     */
    public function exportDocx(Thesis $thesis): StreamedResponse
    {
        $thesis->load(['chapters' => fn ($q) => $q->orderBy('position')->with('currentVersion'), 'user']);

        $phpWord = new PhpWord;
        $phpWord->setDefaultFontName('Times New Roman');
        $phpWord->setDefaultFontSize(12);

        // Standar margin skripsi: Kiri 4cm (2268 twips), Atas 4cm, Kanan 3cm (1701 twips), Bawah 3cm
        $sectionStyle = [
            'marginLeft' => 2268,
            'marginTop' => 2268,
            'marginRight' => 1701,
            'marginBottom' => 1701,
            'pageSizeW' => 11906, // A4
            'pageSizeH' => 16838,
        ];

        // 1. Cover Page Section
        $coverSection = $phpWord->addSection($sectionStyle);
        $coverSection->addTextBreak(3);

        $coverSection->addText(
            mb_strtoupper($thesis->title, 'UTF-8'),
            ['bold' => true, 'size' => 14],
            ['alignment' => Jc::CENTER, 'spaceAfter' => 240]
        );

        $coverSection->addTextBreak(2);
        $coverSection->addText(
            'SKRIPSI',
            ['bold' => true, 'size' => 14],
            ['alignment' => Jc::CENTER, 'spaceAfter' => 240]
        );

        $coverSection->addTextBreak(4);
        $coverSection->addText(
            'Disusun oleh:',
            ['size' => 12],
            ['alignment' => Jc::CENTER]
        );
        $coverSection->addText(
            $thesis->user?->name ?? 'Mahasiswa',
            ['bold' => true, 'size' => 12],
            ['alignment' => Jc::CENTER, 'spaceAfter' => 240]
        );

        $coverSection->addTextBreak(6);
        $coverSection->addText(
            'PROGRAM STUDI SARJANA',
            ['bold' => true, 'size' => 12],
            ['alignment' => Jc::CENTER]
        );
        $coverSection->addText(
            date('Y'),
            ['bold' => true, 'size' => 12],
            ['alignment' => Jc::CENTER]
        );

        // 2. Chapters Section with Header & Footer page number
        $bodySection = $phpWord->addSection($sectionStyle);
        $footer = $bodySection->addFooter();
        $footer->addPreserveText('{PAGE}', ['size' => 10], ['alignment' => Jc::RIGHT]);

        foreach ($thesis->chapters as $index => $chapter) {
            if ($index > 0) {
                $bodySection->addPageBreak();
            }

            $chapterTitle = mb_strtoupper($chapter->title, 'UTF-8');
            $bodySection->addText(
                $chapterTitle,
                ['bold' => true, 'size' => 14],
                ['alignment' => Jc::CENTER, 'spaceAfter' => 240, 'spaceBefore' => 120]
            );

            $content = $chapter->currentVersion?->markdown_content;
            if (empty(trim((string) $content))) {
                $bodySection->addText(
                    '[Belum ada konten untuk bab ini]',
                    ['italic' => true, 'color' => '888888'],
                    ['alignment' => Jc::BOTH, 'spaceAfter' => 120]
                );
                continue;
            }

            $lines = explode("\n", $content);
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if ($trimmed === '') {
                    $bodySection->addTextBreak(1);
                    continue;
                }

                if (str_starts_with($trimmed, '# ')) {
                    $bodySection->addText(
                        substr($trimmed, 2),
                        ['bold' => true, 'size' => 14],
                        ['alignment' => Jc::CENTER, 'spaceBefore' => 180, 'spaceAfter' => 120]
                    );
                } elseif (str_starts_with($trimmed, '## ')) {
                    $bodySection->addText(
                        substr($trimmed, 3),
                        ['bold' => true, 'size' => 12],
                        ['alignment' => Jc::LEFT, 'spaceBefore' => 140, 'spaceAfter' => 80]
                    );
                } elseif (str_starts_with($trimmed, '### ')) {
                    $bodySection->addText(
                        substr($trimmed, 4),
                        ['bold' => true, 'italic' => true, 'size' => 12],
                        ['alignment' => Jc::LEFT, 'spaceBefore' => 100, 'spaceAfter' => 60]
                    );
                } elseif (str_starts_with($trimmed, '- ') || str_starts_with($trimmed, '* ')) {
                    $bodySection->addListItem(
                        substr($trimmed, 2),
                        0,
                        ['size' => 12],
                        ['spaceAfter' => 60]
                    );
                } else {
                    $bodySection->addText(
                        $trimmed,
                        ['size' => 12],
                        ['alignment' => Jc::BOTH, 'lineHeight' => 1.5, 'spaceAfter' => 120]
                    );
                }
            }
        }

        $filename = 'Skripsi_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $thesis->title) . '.docx';

        return response()->streamDownload(
            function () use ($phpWord): void {
                $tempFile = tempnam(sys_get_temp_dir(), 'thesio_export_docx_');
                $writer = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
                $writer->save($tempFile);
                readfile($tempFile);
                @unlink($tempFile);
            },
            $filename,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]
        );
    }

    /**
     * Export complete compiled thesis to printable/downloadable HTML/PDF stream.
     */
    public function exportPdf(Thesis $thesis): StreamedResponse
    {
        $thesis->load(['chapters' => fn ($q) => $q->orderBy('position')->with('currentVersion'), 'user']);

        $title = e($thesis->title);
        $author = e($thesis->user?->name ?? 'Mahasiswa');
        $year = date('Y');

        $html = "<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\"><title>{$title}</title>";
        $html .= '<style>
            @page { size: A4 portrait; margin: 4cm 3cm 3cm 4cm; }
            body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; color: #000; margin: 0; padding: 0; }
            .page-break { page-break-after: always; }
            .cover { text-align: center; display: flex; flex-direction: column; justify-content: space-between; height: 100vh; }
            .cover h1 { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin-top: 50px; margin-bottom: 30px; }
            .cover .type { font-size: 14pt; font-weight: bold; margin-bottom: 80px; }
            .cover .author-section { margin-bottom: 120px; font-size: 12pt; }
            .cover .institution { font-size: 12pt; font-weight: bold; text-transform: uppercase; margin-bottom: 40px; }
            .chapter-title { font-size: 14pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 24px; margin-top: 12px; }
            h2 { font-size: 12pt; font-weight: bold; margin-top: 18px; margin-bottom: 10px; }
            h3 { font-size: 12pt; font-style: italic; font-weight: bold; margin-top: 14px; margin-bottom: 8px; }
            p { text-align: justify; text-indent: 1cm; margin-bottom: 12px; margin-top: 0; }
            ul, ol { margin-top: 0; margin-bottom: 12px; padding-left: 1.5cm; }
            li { text-align: justify; margin-bottom: 4px; }
            @media print { .no-print { display: none; } body { padding: 0; } }
        </style></head><body>';

        // 1. Cover
        $html .= "<div class=\"cover page-break\">";
        $html .= "<h1>{$title}</h1>";
        $html .= "<div class=\"type\">SKRIPSI</div>";
        $html .= "<div class=\"author-section\"><p style=\"text-align:center;text-indent:0;\">Disusun oleh:</p><p style=\"text-align:center;text-indent:0;font-weight:bold;\">{$author}</p></div>";
        $html .= "<div class=\"institution\">PROGRAM STUDI SARJANA<br>{$year}</div>";
        $html .= "</div>";

        // 2. Chapters
        foreach ($thesis->chapters as $index => $chapter) {
            $breakClass = $index < count($thesis->chapters) - 1 ? 'page-break' : '';
            $chapTitle = e(mb_strtoupper($chapter->title, 'UTF-8'));
            $html .= "<div class=\"chapter {$breakClass}\">";
            $html .= "<div class=\"chapter-title\">{$chapTitle}</div>";

            $content = $chapter->currentVersion?->markdown_content;
            if (empty(trim((string) $content))) {
                $html .= "<p style=\"color:#888;font-style:italic;text-indent:0;\">[Belum ada konten untuk bab ini]</p>";
            } else {
                $lines = explode("\n", $content);
                $inList = false;
                foreach ($lines as $line) {
                    $trimmed = trim($line);
                    if ($trimmed === '') {
                        if ($inList) {
                            $html .= "</ul>";
                            $inList = false;
                        }
                        continue;
                    }

                    if (str_starts_with($trimmed, '# ')) {
                        if ($inList) { $html .= "</ul>"; $inList = false; }
                        $html .= "<h1 style=\"text-align:center;font-size:14pt;\">" . e(substr($trimmed, 2)) . "</h1>";
                    } elseif (str_starts_with($trimmed, '## ')) {
                        if ($inList) { $html .= "</ul>"; $inList = false; }
                        $html .= "<h2>" . e(substr($trimmed, 3)) . "</h2>";
                    } elseif (str_starts_with($trimmed, '### ')) {
                        if ($inList) { $html .= "</ul>"; $inList = false; }
                        $html .= "<h3>" . e(substr($trimmed, 4)) . "</h3>";
                    } elseif (str_starts_with($trimmed, '- ') || str_starts_with($trimmed, '* ')) {
                        if (!$inList) {
                            $html .= "<ul>";
                            $inList = true;
                        }
                        $html .= "<li>" . e(substr($trimmed, 2)) . "</li>";
                    } else {
                        if ($inList) { $html .= "</ul>"; $inList = false; }
                        $html .= "<p>" . e($trimmed) . "</p>";
                    }
                }
                if ($inList) {
                    $html .= "</ul>";
                }
            }
            $html .= "</div>";
        }

        $html .= '</body></html>';

        $filename = 'Skripsi_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $thesis->title) . '.html';

        return response()->streamDownload(
            function () use ($html): void {
                echo $html;
            },
            $filename,
            ['Content-Type' => 'text/html; charset=utf-8']
        );
    }
}
