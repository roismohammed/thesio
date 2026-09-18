# LLM Contract — Guidance Agenda Generation

**Feature**: 003-supervision-guide | **Provider**: OpenRouter (`https://openrouter.ai/api/v1`) via the existing `openai-php/laravel` client (OpenAI-compatible).

## Client / config

- Reuse `OpenAI::chat()->create([...])` (the same facade `CreateParaphraseAction` uses).
- Base URL, key, model come from `config('openai.php`) → env `LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`.
- The LLM call lives in `App\Services\Thesis\GuidanceLlmClient` (infra Service, per constitution I — external API is Service territory). `CreateSupervisionGuideAction` calls this client, then persists.

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
Kamu adalah asisten bimbingan skripsi. Tugasmu menyusun agenda bimbingan:
daftar poin diskusi apa yang harus dibawa mahasiswa ke dosen pembimbing pada
sesi bimbingan berikutnya, berdasarkan catatan notulen bimbingan sebelumnya,
deadline sidang, dan status bab skripsi.

Aturan:
- Prioritaskan poin berdasarkan sisa waktu menuju deadline sidang; makin dekat
  deadline, poin mendesak muncul lebih dulu (priority lebih kecil = lebih mendesak).
- Untuk setiap poin, tautkan ke chapter_id dan/atau supervision_note_id asal
  bila relevan; gunakan ID yang diberikan di konteks, atau null.
- Hanya angkat poin yang benar-benar relevan; jangan mengarang poin tanpa dasar.
- Jika tidak ada notulen dan semua bab sudah final/selesai, kembalikan array
  points kosong.
- Kembalikan HANYA JSON valid sesuai skema, tanpa penjelasan tambahan.

Skema JSON:
{
  "points": [
    { "title": string, "description": string,
      "chapter_id": integer|null, "supervision_note_id": integer|null,
      "priority": integer }
  ]
}
```

### User content (assembled by `GuidanceLlmClient` from the thesis state)

```json
{
  "thesis_title": "...",
  "defense_deadline_at": "2026-09-30",
  "defense_remaining_days": 51,
  "deadline_set": true,
  "chapters": [
    { "id": 7, "title": "Bab II — Tinjauan Pustaka", "status": "draft",
      "has_readable_content": true }
  ],
  "notulen": [
    { "id": 4, "chapter_id": 7, "content": "...notulen text...",
      "created_at": "2026-08-02T10:00:00Z" }
  ],
  "previous_open_points": [
    { "title": "...", "from_supervision_note_id": 4 }
  ]
}
```

- `notulen.content` may be truncated per note to keep the prompt bounded (e.g. first ~2000 chars).
- `previous_open_points` is derived by the service from prior guides' points that were never marked `prepared` (cross-session continuity, US3) — included as context, not a requirement.

## Response handling

- Parse `choices[0].message->content` as JSON. Validate shape: `points` is a list; each item has `title` (string, non-empty), `description` (string), and integer-or-null `chapter_id`/`supervision_note_id`/`priority`.
- **Reject unknown IDs**: any `chapter_id`/`supervision_note_id` not belonging to the thesis is set to `null` (the link is dropped, the point is kept if otherwise valid).
- **Normalise priority**: re-sort points server-side by `priority` asc, then assign stable integers 1..N.
- **Empty agenda is valid**: if `points` is empty (e.g. all chapters final, no open notulen), persist a guide with zero points and a narrative noting "tidak ada poin mendesak". This is a successful generation, not a failure.
- **Failure modes** (no guide persisted, FR-016):
  - HTTP/timeout/exception from the client.
  - Non-JSON or schema-invalid content that cannot be salvaged.
  - On failure, `CreateSupervisionGuideAction` throws; `SupervisionGuideService` catches, logs a narrative failure entry, and leaves the previous current guide intact.

## Cost / guardrails

- One LLM call per generation (per thesis, per scheduled run or on-demand request). No multi-turn conversation.
- `request_timeout` from `config('openai.request_timeout', 30)` governs the HTTP timeout (already configurable).
- Skip-if-tailored (FR-018) and deadline-passed (FR-010) guards run **before** the LLM call, so no tokens are spent when generation should not happen.
- Redundant-run skip (no thesis/notulen change since last generation) may also short-circuit before the LLM call (edge case) — optional in v1; the skip-if-tailored guard is the primary throttle.