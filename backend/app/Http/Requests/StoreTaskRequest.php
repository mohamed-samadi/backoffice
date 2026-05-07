<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'              => ['required', 'string', 'max:255'],
            'notes'              => ['nullable', 'string'],
            'priority'           => ['nullable', 'in:low,normal,high,urgent'],
            'status'             => ['nullable', 'in:todo,in_progress,completed'],
            'due_date'           => ['nullable', 'date'],
            'task_category_id'   => ['nullable', 'exists:task_categories,id'],
            'client_id'          => ['nullable', 'exists:clients,id'],
            'user_id'            => ['nullable', 'exists:users,id'],
        ];
    }
}