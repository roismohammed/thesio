<?php

namespace App\Http\Requests\Thesis;

use App\Models\Thesis;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGuidancePointRequest extends FormRequest
{
    /**
     * Tailoring a point is a write action on the thesis.
     */
    public function authorize(): bool
    {
        $thesis = $this->route('thesis');

        return $thesis instanceof Thesis && $this->user()?->can('update', $thesis) === true;
    }

    /**
     * Get the validation rules that apply to the request. Title/description
     * are editable below only for student points (enforced in the Action).
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['nullable', 'in:pending,prepared'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
