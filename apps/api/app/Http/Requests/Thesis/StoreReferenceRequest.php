<?php

namespace App\Http\Requests\Thesis;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreReferenceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'type' => $this->input('type') ?? ($this->hasFile('file') ? 'file' : 'link'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['link', 'file'])],
            'title' => ['required', 'string', 'max:255'],
            'authors' => ['nullable', 'string', 'max:255'],
            'year' => ['nullable', 'string', 'max:10'],
            'publication' => ['nullable', 'string', 'max:255'],
            'volume' => ['nullable', 'string', 'max:100'],
            'pages' => ['nullable', 'string', 'max:100'],
            'doi' => ['nullable', 'string', 'max:255'],
            'url' => [
                'required_if:type,link',
                'nullable',
                'string',
                'max:2048',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if ($value && ! Str::startsWith($value, ['http://', 'https://'])) {
                        $fail('Tautan harus diawali http:// atau https://.');
                    }
                },
            ],
            'file' => [
                'required_if:type,file',
                'nullable',
                'file',
                'mimes:pdf,doc,docx',
                'max:'.config('thesis.max_upload_kb', 10240),
            ],
        ];
    }
}
