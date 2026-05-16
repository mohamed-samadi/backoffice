<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class ChequeNotification extends Notification
{
    public function __construct(
        public string $message,
        public string $niveau,   // critique | warning
        public int    $cheque_id,
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
            'type'      => 'cheque',
            'niveau'    => $this->niveau,
            'message'   => $this->message,
            'cheque_id' => $this->cheque_id,
            'numero'    => $this->numero,
            'client'    => $this->client,
        ];
    }
}