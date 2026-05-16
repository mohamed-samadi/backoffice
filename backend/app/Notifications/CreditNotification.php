<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class CreditNotification extends Notification
{
    public function __construct(
        public string $message,
        public string $niveau,
        public int    $credit_id,
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
            'type'      => 'credit',
            'niveau'    => $this->niveau,
            'message'   => $this->message,
            'credit_id' => $this->credit_id,
            'numero'    => $this->numero,
            'client'    => $this->client,
        ];
    }
}