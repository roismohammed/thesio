<?php

return [

    /*
    |--------------------------------------------------------------------------
    | LLM API Key and Organization
    |--------------------------------------------------------------------------
    |
    | OpenAI-compatible provider. The base URL, key, and model are
    | env-configurable (LLM_BASE_URL / LLM_API_KEY / LLM_MODEL) so the same
    | code works against OpenAI, an OpenAI-compatible gateway, or a local
    | endpoint (see research.md D2).
    */

    'api_key' => env('LLM_API_KEY', env('OPENAI_API_KEY')),
    'organization' => env('LLM_ORGANIZATION', env('OPENAI_ORGANIZATION')),

    /*
    |--------------------------------------------------------------------------
    | LLM Base URL
    |--------------------------------------------------------------------------
    |
    | OpenAI-compatible API base URL. Defaults to: api.openai.com/v1
    */
    'base_uri' => env('LLM_BASE_URL', env('OPENAI_BASE_URL')),

    /*
    |--------------------------------------------------------------------------
    | Request Timeout
    |--------------------------------------------------------------------------
    |
    | Maximum seconds to wait for a response before timing out.
    */
    'request_timeout' => env('LLM_REQUEST_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | LLM Model
    |--------------------------------------------------------------------------
    |
    | The model used for paraphrase generation.
    */
    'llm_model' => env('LLM_MODEL', 'gpt-4o-mini'),

    /*
    |--------------------------------------------------------------------------
    | Guidance Schedule
    |--------------------------------------------------------------------------
    |
    | Cron expression for the scheduled bimbingan guidance generation.
    | Default: Monday 08:00 weekly.
    */
    'guidance' => [
        'schedule' => env('GUIDANCE_SCHEDULE', '0 8 * * 1'),
    ],
];
