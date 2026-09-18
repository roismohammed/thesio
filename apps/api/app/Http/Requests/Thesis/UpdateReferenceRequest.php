<?php

namespace App\Http\Requests\Thesis;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateReferenceRequest extends FormRequest
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
            'authors' => ['sometimes', 'nullable', 'string', 'max:255'],
            'year' => ['sometimes', 'nullable', 'string', 'max:10'],
            'publication' => ['sometimes', 'nullable', 'string', 'max:255'],
            'volume' => ['sometimes', 'nullable', 'string', 'max:100'],
            'pages' => ['sometimes', 'nullable', 'string', 'max:100'],
            'doi' => ['sometimes', 'nullable', 'string', 'max:255'],
            'url' => [
                'sometimes',
                'nullable',
                'string',
                'max:2048',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if ($value && ! Str::startsWith($value, ['http://', 'https://'])) {
                        $fail('Tautan harus diawali http:// atau https://.');
                    }
                },
            ],
        ];
    }
}
