# LLM Contract — Task Suggestion Generation

**Feature**: 005-thesis-kanban-tasks | **Provider**: OpenRouter (`https://openrouter.ai/api/v1`) via the existing `openai-php/laravel` client (OpenAI-compatible).

## Client / config

- Reuse `OpenAI::chat()->create([...])` — same facade as `CreateSupervisionGuideAction`/`GuidanceLlmClient` (003) and `CreateParaphraseAction` (002).
- Base URL, key, model from `config('openai.php')` → env `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`.
- LLM call lives in `App\Services\Thesis\TaskSuggestionLlmClient` (infra Service, constitution I — external API is Service territory). `CreateTaskSuggestionAction` calls this client, then persists suggestions.

## Request

```php
OpenAI::chat()->create([
    'model' => config('openai.llm_model', env('LLM_MODEL', 'gpt-4o-mini')),
    'response_format' => ['type' => 'json_object'],
    'messages' => [
        ['role' => 'system', 'content' => <SYSTEM_PROMPT>],
        ['role' => 'user',   'content' => <assembled context JSON>],
    ],
]);
```

### System prompt (fixed, Indonesian)

```
Kamu adalah asisten yang membantu mahasiswa merencanakan pekerjaan skripsi.
Tugasmu menyarankan tugas konkret yang harus dikerjakan mahasiswa, berdasarkan:
1. Catatan notulen revisi dosen per bab (bagian yang ditandai perlu direvisi).
2. Bab skripsi yang belum lengkap (masih berstatus draft).
Acarakan saran pada deadline sidang yang sudah ditentukan.

Aturan:
- Untuk setiap saran, tautkan ke chapter_id dan/atau supervision_note_id asal
  bila relevan; gunakan ID yang diberikan di konteks, atau null.
- Berikan priority integer; lebih kecil = lebih mendesak. Urutkan menurut
  kepentingan: revisi notulen dosen lebih didahulukan daripada pelengkapan bab.
- Hanya sarankan tugas yang benar-benar relevan; jangan mengarang tugas tanpa
  dasar dari notulen atau status bab.
- Jika tidak ada notulen dan semua bab sudah lengkap (bukan draft),
  kembalikan array suggestions kosong.
- Jangan sarankan tugas yang sudah ada di daftar existing_tasks (hindari duplikat).
- Kembalikan HANYA JSON valid sesuai skema, tanpa penjelasan tambahan.

Skema JSON:
{
  "suggestions": [
    { "title": string, "description": string,
      "chapter_id": integer|null, "supervision_note_id": integer|null,
      "priority": integer,
      "source_type": "note_revision" | "chapter_draft" }
  ]
}
```

### User content (assembled by `TaskSuggestionLlmClient` from thesis state)

```json
{
  "thesis_title": "...",
  "defense_deadline_at": "2026-09-30",
  "defense_remaining_days": 51,
  "deadline_set": true,
  "chapters": [
    { "id": 7, "title": "Bab I — Pendahuluan", "status": "draft" },
    { "id": 8, "title": "Bab II — Tinjauan Pustaka", "status": "submitted" }
  ],
  "notulen": [
    { "id": 4, "chapter_id": 7, "content": "...notulen revisi dosen..." }
  ],
  "existing_tasks": [
    { "title": "Revisi BAB 1", "status": "todo" }
  ]
}
```

- `notulen.content` truncated per note (first ~2000 chars) to bound prompt.
- `chapters` includes only `status` in `['draft','submitted']` (not `reviewed`) — "belum lengkap".
- `existing_tasks` lets the LLM avoid suggesting duplicates (title-level).

## Response handling

- Parse `choices[0].message->content` as JSON. Validate shape: `suggestions` is a list; each item has `title` (string non-empty), `description` (string), `priority` (integer), `source_type` (`'note_revision'` or `'chapter_draft'`), and integer-or-null `chapter_id`/`supervision_note_id`.
- **Reject unknown IDs**: any `chapter_id`/`supervision_note_id` not belonging to the thesis → set to null (link dropped, suggestion kept if otherwise valid).
- **Normalise priority**: re-sort server-side by `priority` asc, assign stable 1..N.
- **Dedup (D9)**: compute `signature` per suggestion (`source_type|source_id|normalized_title`); skip any suggestion whose signature already exists for this thesis in `task_suggestions` (any status — pending/accepted/rejected). `accepted` tasks already have a corresponding Task; `rejected` must not reappear.
- **Empty suggestions is valid**: if LLM returns empty (all chapters complete, no notulen), persist zero suggestions, return empty array. Success, not failure.
- **Failure modes** (no suggestions persisted):
  - HTTP/timeout/exception from client.
  - Non-JSON or schema-invalid content that cannot be salvaged.
  - On failure, `CreateTaskSuggestionAction` throws; `TaskSuggestionService` catches, logs a narrative failure entry, returns 422 to caller. No partial suggestions saved.

## Deadline note

- The LLM does **not** compute deadlines. `due_at`/`due_at_suggestion` are computed server-side by `TaskService` (D2) for consistency with the recalc-on-deadline-change rule (FR-009). The LLM only returns `priority`; the server maps priority → deadline via the proportional formula.

## Cost / guardrails

- One LLM call per on-demand suggestion request (per thesis). No multi-turn.
- `request_timeout` from `config('openai.request_timeout', 30)` governs HTTP timeout.
- No scheduled/batched generation for suggestions (on-demand only — D4). The weekly scheduler from 003 (`guidance:generate-scheduled`) is a separate concern (bimbingan agenda); task suggestions are user-triggered.
- Dedup via signature runs post-LLM, so tokens are spent once per request regardless — acceptable (single request, not scheduled fleet).