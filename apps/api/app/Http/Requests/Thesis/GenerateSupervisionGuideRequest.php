<?php

namespace App\Http\Requests\Thesis;

use App\Models\Thesis;
use Illuminate\Foundation\Http\FormRequest;

class GenerateSupervisionGuideRequest extends FormRequest
{
    /**
     * Generation is a read-privilege action producing the student's own data.
     */
    public function authorize(): bool
    {
        $thesis = $this->route('thesis');

        return $thesis instanceof Thesis && $this->user()?->is($thesis->user) === true;
    }

    /**
     * Get the validation rules that apply to the request. No body.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
