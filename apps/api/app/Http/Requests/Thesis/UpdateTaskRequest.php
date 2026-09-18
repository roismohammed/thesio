<?php

namespace App\Http\Requests\Thesis;

use App\Models\Thesis;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Editing a task requires update privilege on the thesis.
     */
    public function authorize(): bool
    {
        $thesis = $this->route('thesis');

        return $thesis instanceof Thesis && $this->user()?->is($thesis->user) === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'priority' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'due_at' => ['sometimes', 'nullable', 'date', 'after:today'],
            'chapter_id' => ['sometimes', 'nullable', 'integer', 'exists:chapters,id'],
            'supervision_note_id' => ['sometimes', 'nullable', 'integer', 'exists:supervision_notes,id'],
            'status' => ['sometimes', Rule::in(['todo', 'doing', 'done'])],
        ];
    }
}