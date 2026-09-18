<?php

namespace App\Http\Requests\Thesis;

use Illuminate\Foundation\Http\FormRequest;

class AiWriteChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'instruction' => ['required', 'string', 'min:5', 'max:2000'],
            'section_title' => ['nullable', 'string', 'max:255'],
            'reference_ids' => ['nullable', 'array'],
            'reference_ids.*' => ['integer', 'exists:chapter_references,id'],
            'current_content' => ['nullable', 'string', 'max:50000'],
            'writing_tone' => ['nullable', 'string', 'in:academic,critical,methodological'],
            'target_length' => ['nullable', 'string', 'in:short,medium,long'],
        ];
    }
}
