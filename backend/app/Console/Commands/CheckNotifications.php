<?php

namespace App\Console\Commands;

use App\Models\Cheque;
use App\Models\Credit;
use App\Models\Document;
use App\Models\Product;
use App\Models\Task;
use App\Models\User;
use App\Notifications\ChequeNotification;
use App\Notifications\CreditNotification;
use App\Notifications\DocumentNotification;
use App\Notifications\StockNotification;
use App\Notifications\TaskNotification;
use Illuminate\Console\Command;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class CheckNotifications extends Command
{
    protected $signature = 'app:check-notifications';
    protected $description = 'Verifie les alertes et envoie les notifications';

    private array $activeAlertKeys = [];

    public function handle(): void
    {
        $this->activeAlertKeys = [];
        $recipients = User::all();

        $this->checkCheques($recipients);
        $this->checkCredits($recipients);
        $this->checkStock($recipients);
        $this->checkDocuments($recipients);
        $this->checkTasks($recipients);
        $this->deleteResolvedNotifications();

        $this->info('Notifications verifiees avec succes.');
    }

    private function checkCheques(Collection $recipients): void
    {
        Cheque::where('statut', 'impaye')
            ->with('client')
            ->get()
            ->each(function ($cheque) use ($recipients) {
                $this->send($recipients, new ChequeNotification(
                    message: "Le cheque {$cheque->numero_cheque} de {$cheque->client?->nom_complet} est impaye.",
                    niveau: 'critique',
                    cheque_id: $cheque->id,
                    numero: $cheque->numero_cheque,
                    client: $cheque->client?->nom_complet ?? 'Inconnu',
                ));
            });

        Cheque::where('statut', 'non_encaisse')
            ->where('date_echeance', '<=', today()->addDays(3)->endOfDay())
            ->with('client')
            ->get()
            ->each(function ($cheque) use ($recipients) {
                $jours = now()->diffInDays($cheque->date_echeance, false);
                $message = $jours < 0
                    ? "Le cheque {$cheque->numero_cheque} est en retard de " . abs((int) $jours) . " jour(s)."
                    : "Le cheque {$cheque->numero_cheque} arrive a echeance dans {$jours} jour(s).";

                $this->send($recipients, new ChequeNotification(
                    message: $message,
                    niveau: $jours < 0 ? 'critique' : 'warning',
                    cheque_id: $cheque->id,
                    numero: $cheque->numero_cheque,
                    client: $cheque->client?->nom_complet ?? 'Inconnu',
                ));
            });
    }

    private function checkCredits(Collection $recipients): void
    {
        Credit::whereNotIn('statut', ['solde', 'annule'])
            ->where('date_echeance', '<=', today()->addDays(7)->endOfDay())
            ->with('client')
            ->get()
            ->each(function ($credit) use ($recipients) {
                $jours = today()->diffInDays($credit->date_echeance, false);
                $isCritical = in_array($credit->statut, ['en_retard', 'impaye'], true) || $jours < 0;
                $client = $credit->client?->nom_complet ?? 'Inconnu';
                $message = $jours < 0
                    ? "Le credit {$credit->numero_credit} de {$client} est en retard de " . abs((int) $jours) . " jour(s)."
                    : "Le credit {$credit->numero_credit} arrive a echeance dans {$jours} jour(s).";

                $this->send($recipients, new CreditNotification(
                    message: $message,
                    niveau: $isCritical ? 'critique' : 'warning',
                    credit_id: $credit->id,
                    numero: $credit->numero_credit ?? 'N/A',
                    client: $client,
                ));
            });
    }

    private function checkStock(Collection $recipients): void
    {
        Product::where('quantite_stock', 0)
            ->where('actif', true)
            ->get()
            ->each(function ($product) use ($recipients) {
                $this->send($recipients, new StockNotification(
                    message: "Le produit \"{$product->nom}\" est en rupture de stock.",
                    niveau: 'critique',
                    product_id: $product->id,
                    nom_produit: $product->nom,
                    quantite: 0,
                ));
            });

        Product::where('actif', true)
            ->where('quantite_stock', '>', 0)
            ->whereColumn('quantite_stock', '<=', 'seuil_alerte_stock')
            ->whereNotNull('seuil_alerte_stock')
            ->get()
            ->each(function ($product) use ($recipients) {
                $this->send($recipients, new StockNotification(
                    message: "Stock faible pour \"{$product->nom}\" - {$product->quantite_stock} unite(s) restante(s).",
                    niveau: 'warning',
                    product_id: $product->id,
                    nom_produit: $product->nom,
                    quantite: $product->quantite_stock,
                ));
            });
    }

    private function checkDocuments(Collection $recipients): void
    {
        Document::where('type', 'facture')
            ->where('statut_paiement', 'non_paye')
            ->where('date_validite', '<', today())
            ->with('client')
            ->get()
            ->each(function ($document) use ($recipients) {
                $this->send($recipients, new DocumentNotification(
                    message: "La facture {$document->numero} de {$document->client?->nom_complet} est expiree et non payee.",
                    niveau: 'critique',
                    document_id: $document->id,
                    numero: $document->numero,
                    client: $document->client?->nom_complet ?? 'Inconnu',
                ));
            });

        Document::where('statut_paiement', 'partial')
            ->whereBetween('date_validite', [today(), today()->addDays(3)->endOfDay()])
            ->with('client')
            ->get()
            ->each(function ($document) use ($recipients) {
                $jours = today()->diffInDays($document->date_validite);

                $this->send($recipients, new DocumentNotification(
                    message: "La facture {$document->numero} a un paiement partiel - echeance dans {$jours} jour(s).",
                    niveau: 'warning',
                    document_id: $document->id,
                    numero: $document->numero,
                    client: $document->client?->nom_complet ?? 'Inconnu',
                ));
            });
    }

    private function checkTasks(Collection $recipients): void
    {
        Task::where('status', '!=', 'completed')
            ->where(function ($query) {
                $query->whereIn('priority', ['high', 'urgent'])
                    ->orWhere('due_date', '<=', today()->addDays(2)->endOfDay());
            })
            ->with(['client:id,nom_complet', 'category:id,name'])
            ->get()
            ->each(function ($task) use ($recipients) {
                $jours = $task->due_date
                    ? today()->diffInDays($task->due_date, false)
                    : null;

                $isOverdue = $jours !== null && $jours < 0;
                $niveau = $isOverdue || $task->priority === 'urgent' ? 'critique' : 'warning';
                $client = $task->client?->nom_complet ?? 'Aucun client';
                $category = $task->category?->name ?? 'Sans categorie';

                if ($isOverdue) {
                    $message = "La tache \"{$task->title}\" est en retard de " . abs((int) $jours) . " jour(s).";
                } elseif ($jours !== null && $jours <= 2) {
                    $message = "La tache \"{$task->title}\" arrive a echeance dans {$jours} jour(s).";
                } elseif ($task->priority === 'urgent') {
                    $message = "La tache urgente \"{$task->title}\" est toujours ouverte.";
                } else {
                    $message = "La tache prioritaire \"{$task->title}\" est toujours ouverte.";
                }

                $this->send($recipients, new TaskNotification(
                    message: $message,
                    niveau: $niveau,
                    task_id: $task->id,
                    title: $task->title,
                    status: $task->status,
                    priority: $task->priority,
                    due_date: $task->due_date,
                    client: $client,
                    category: $category,
                ));
            });
    }

    private function send(Collection $recipients, Notification $notification): void
    {
        $data = $notification->toDatabase(new User());
        $alertKey = $this->alertKey($data);

        if ($alertKey) {
            $this->activeAlertKeys[$alertKey] = true;
        }

        if ($recipients->isNotEmpty()) {
            $recipients->each(function (User $user) use ($notification, $data) {
                $existing = $this->findNotification($data, $user->id);

                if ($existing) {
                    $existing->forceFill(['data' => $data])->save();
                } else {
                    $user->notify($notification);
                }
            });

            return;
        }

        $existing = $this->findNotification($data, 1);

        if ($existing) {
            $existing->forceFill(['data' => $data])->save();
            return;
        }

        DatabaseNotification::forceCreate([
            'id' => (string) Str::uuid(),
            'type' => get_class($notification),
            'notifiable_type' => User::class,
            'notifiable_id' => 1,
            'data' => $data,
            'read_at' => null,
        ]);
    }

    private function findNotification(array $data, int $notifiableId): ?DatabaseNotification
    {
        $query = DatabaseNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $notifiableId)
            ->where('data->type', $data['type'] ?? null);

        foreach (['cheque_id', 'credit_id', 'product_id', 'document_id', 'task_id'] as $key) {
            if (array_key_exists($key, $data)) {
                $query->where("data->{$key}", $data[$key]);
            }
        }

        return $query->first();
    }

    private function deleteResolvedNotifications(): void
    {
        DatabaseNotification::query()
            ->whereIn('data->type', ['cheque', 'credit', 'stock', 'document', 'task'])
            ->get()
            ->each(function (DatabaseNotification $notification) {
                $key = $this->alertKey($notification->data ?? []);

                if ($key && ! isset($this->activeAlertKeys[$key])) {
                    $notification->delete();
                }
            });
    }

    private function alertKey(array $data): ?string
    {
        foreach (['cheque_id', 'credit_id', 'product_id', 'document_id', 'task_id'] as $key) {
            if (array_key_exists($key, $data)) {
                return ($data['type'] ?? 'unknown') . ':' . $key . ':' . $data[$key];
            }
        }

        return null;
    }
}
