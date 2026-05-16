<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class TaskNotification extends Notification
{
    public function __construct(
        public string $message,
        public string $niveau,
        public int $task_id,
        public string $title,
        public string $status,
        public string $priority,
        public ?string $due_date,
        public string $client,
        public string $category,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'task',
            'niveau' => $this->niveau,
            'message' => $this->message,
            'task_id' => $this->task_id,
            'title' => $this->title,
            'status' => $this->status,
            'priority' => $this->priority,
            'due_date' => $this->due_date,
            'client' => $this->client,
            'category' => $this->category,
        ];
    }
}
