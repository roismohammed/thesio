<?php

namespace App\Http\Requests\Thesis;

use App\Models\Thesis;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuidancePointRequest extends FormRequest
{
    /**
     * Adding a custom point is a tailoring (write) action.
     */
    public function authorize(): bool
    {
        $thesis = $this->route('thesis');

        return $thesis instanceof Thesis && $this->user()?->can('update', $thesis) === true;
    }

    /**
     * Get the validation rules that apply to the request. `origin`, `status`,
     * and `priority` are forced in the Action, not read from the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'chapter_id' => ['nullable', 'integer', Rule::exists('chapters', 'id')],
            'supervision_note_id' => ['nullable', 'integer', Rule::exists('supervision_notes', 'id')],
        ];
    }
}
