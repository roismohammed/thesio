<?php

namespace App\Http\Requests\Thesis;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChapterRequest extends FormRequest
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
            'title' => ['sometimes', 'string', 'max:255'],
            'position' => ['nullable', 'integer', 'min:1'],
            'status' => ['sometimes', Rule::in(['draft', 'submitted', 'reviewed'])],
        ];
    }
}
