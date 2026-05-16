<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class StockNotification extends Notification
{
    public function __construct(
        public string $message,
        public string $niveau,
        public int    $product_id,
        public string $nom_produit,
        public int    $quantite,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'        => 'stock',
            'niveau'      => $this->niveau,
            'message'     => $this->message,
            'product_id'  => $this->product_id,
            'nom_produit' => $this->nom_produit,
            'quantite'    => $this->quantite,
        ];
    }
}