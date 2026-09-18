<?php

namespace App\Http\Requests\Thesis;

use App\Models\Thesis;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Creating a task mutates the thesis board (update privilege).
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', 'integer', 'min:0'],
            'chapter_id' => ['nullable', 'integer', 'exists:chapters,id'],
            'supervision_note_id' => ['nullable', 'integer', 'exists:supervision_notes,id'],
        ];
    }
}