<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class DocumentNotification extends Notification
{
    public function __construct(
        public string $message,
        public string $niveau,
        public int    $document_id,
        public string $numero,
        public string $client,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'        => 'document',
            'niveau'      => $this->niveau,
            'message'     => $this->message,
            'document_id' => $this->document_id,
            'numero'      => $this->numero,
            'client'      => $this->client,
        ];
    }
}