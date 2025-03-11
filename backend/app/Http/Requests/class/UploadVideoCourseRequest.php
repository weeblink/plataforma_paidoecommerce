<?php

namespace App\Http\Requests\class;

use Illuminate\Foundation\Http\FormRequest;

class UploadVideoCourseRequest extends FormRequest
{

    const MAX_VIDEO_SIZE = 10737418240;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'resumableChunkNumber' => ['sometimes', 'required', 'integer'],
            'resumableChunkSize' => ['sometimes', 'required', 'integer'],
            'resumableTotalSize' => ['sometimes', 'required', 'integer'],
            'resumableTotalChunks' => ['sometimes', 'required', 'integer'],
            'resumableIdentifier' => ['sometimes', 'required', 'string'],
            'resumableFilename' => ['sometimes', 'required', 'string'],
            'resumableRelativePath' => ['sometimes', 'required', 'string'],
        ];
    }
}
