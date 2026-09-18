<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Upload Limits
    |--------------------------------------------------------------------------
    |
    | Maximum accepted size for chapter documents and reference files, in
    | kilobytes (default 10 MB). Tuned via a config constant per research D3.
    |
    */

    'max_upload_kb' => env('THESIS_MAX_UPLOAD_KB', 10240),

    /*
    |--------------------------------------------------------------------------
    | Allowed Document MIME Types
    |--------------------------------------------------------------------------
    |
    | Chapter uploads and file references accept PDF + Word documents.
    |
    */

    'allowed_mimes' => [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],

    /*
    |--------------------------------------------------------------------------
    | Paraphrase
    |--------------------------------------------------------------------------
    |
    | Max selection length (chars) for a paraphrase request (research D2).
    |
    */

    'paraphrase_max_selection' => 5000,

    /*
    |--------------------------------------------------------------------------
    | Task Urgency Threshold
    |--------------------------------------------------------------------------
    |
    | A task whose due date falls within this many days of now is considered
    | "mendekati" (soon). Tuned via a config constant per research D3.
    |
    */

    'task_urgent_within_days' => env('THESIS_TASK_URGENT_WITHIN_DAYS', 7),
];
