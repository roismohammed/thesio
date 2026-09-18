<?php

namespace App\Http\Requests\Thesis;

use Illuminate\Foundation\Http\FormRequest;

class ParaphraseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'selection' => ['required', 'string', 'min:10', 'max:'.config('thesis.paraphrase_max_selection', 5000)],
            'supervision_note_id' => ['nullable', 'integer', 'exists:supervision_notes,id'],
            'custom_instruction' => ['nullable', 'string', 'max:1000'],
            'reference_context' => ['nullable', 'string', 'max:3000'],
            'style_mode' => ['nullable', 'string', 'in:academic,concise,elaborative'],
        ];
    }
}
