<?php

namespace App\Http\Requests\Thesis;

use App\Models\Thesis;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MoveTaskRequest extends FormRequest
{
    /**
     * Moving a task mutates the thesis board (update privilege).
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
            'status' => ['required', Rule::in(['todo', 'doing', 'done'])],
            'position' => ['required', 'integer', 'min:0'],
        ];
    }
}