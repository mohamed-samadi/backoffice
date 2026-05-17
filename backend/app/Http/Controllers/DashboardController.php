<?php

namespace App\Http\Controllers;

use App\Models\Cheque;
use App\Models\Client;
use App\Models\Credit;
use App\Models\Document;
use App\Models\Fournisseur;
use App\Models\Product;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = Carbon::today();
        $startOfYear = $today->copy()->startOfYear();

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $this->summary(),
                'finance' => $this->finance(),
                'stock' => $this->stock(),
                'tasks' => $this->tasks($today),
                'analytics' => $this->analytics($startOfYear),
                'recent_documents' => $this->recentDocuments(),
                'recent_users' => $this->recentUsers(),
                'alerts' => $this->alerts($today),
            ],
            'message' => 'Dashboard recupere avec succes',
        ], 200);
    }

    private function summary(): array
    {
        return [
            'clients' => [
                'total' => Client::count(),
                'active' => Client::where('statut', 'actif')->count(),
            ],
            'fournisseurs' => [
                'total' => Fournisseur::count(),
                'active' => Fournisseur::where('actif', true)->count(),
            ],
            'products' => [
                'total' => Product::count(),
                'active' => Product::where('actif', true)->count(),
            ],
            'users' => [
                'total' => User::count(),
                'verified' => User::whereNotNull('email_verified_at')->count(),
            ],
        ];
    }

    private function finance(): array
    {
        $documents = Document::selectRaw('
            COUNT(*) as total_documents,
            SUM(total_ttc) as chiffre_affaires,
            SUM(reste_a_payer) as reste_a_payer,
            SUM(CASE WHEN statut_paiement = "paye" THEN 1 ELSE 0 END) as documents_payes,
            SUM(CASE WHEN statut_paiement <> "paye" THEN 1 ELSE 0 END) as documents_impayes
        ')->first();

        $credits = Credit::selectRaw('
            COUNT(*) as total_credits,
            SUM(montant_total) as montant_total,
            SUM(montant_paye) as montant_paye,
            SUM(reste) as reste
        ')->first();

        $cheques = Cheque::selectRaw('
            COUNT(*) as total_cheques,
            SUM(montant) as montant_total,
            SUM(CASE WHEN statut = "encaisse" THEN montant ELSE 0 END) as montant_encaisse,
            SUM(CASE WHEN statut = "non_encaisse" THEN montant ELSE 0 END) as montant_attente
        ')->first();

        return [
            'documents' => [
                'total' => (int) ($documents->total_documents ?? 0),
                'chiffre_affaires' => (float) ($documents->chiffre_affaires ?? 0),
                'reste_a_payer' => (float) ($documents->reste_a_payer ?? 0),
                'payes' => (int) ($documents->documents_payes ?? 0),
                'impayes' => (int) ($documents->documents_impayes ?? 0),
            ],
            'credits' => [
                'total' => (int) ($credits->total_credits ?? 0),
                'montant_total' => (float) ($credits->montant_total ?? 0),
                'montant_paye' => (float) ($credits->montant_paye ?? 0),
                'reste' => (float) ($credits->reste ?? 0),
            ],
            'cheques' => [
                'total' => (int) ($cheques->total_cheques ?? 0),
                'montant_total' => (float) ($cheques->montant_total ?? 0),
                'montant_encaisse' => (float) ($cheques->montant_encaisse ?? 0),
                'montant_attente' => (float) ($cheques->montant_attente ?? 0),
            ],
        ];
    }

    private function stock(): array
    {
        $stats = Product::selectRaw('
            COUNT(*) as total,
            SUM(quantite_stock) as stock_total,
            SUM(CASE WHEN quantite_stock < COALESCE(seuil_alerte_stock, 10) THEN 1 ELSE 0 END) as stock_faible,
            AVG(prix_unitaire_ht) as prix_moyen
        ')->first();

        $lowStock = Product::with(['category:id,name', 'fournisseur:id,nom'])
            ->whereRaw('quantite_stock < COALESCE(seuil_alerte_stock, 10)')
            ->orderBy('quantite_stock')
            ->limit(6)
            ->get(['id', 'category_id', 'fournisseur_id', 'nom', 'quantite_stock', 'seuil_alerte_stock']);

        return [
            'total' => (int) ($stats->total ?? 0),
            'stock_total' => (int) ($stats->stock_total ?? 0),
            'stock_faible' => (int) ($stats->stock_faible ?? 0),
            'prix_moyen' => (float) ($stats->prix_moyen ?? 0),
            'low_stock' => $lowStock,
        ];
    }

    private function tasks(Carbon $today): array
    {
        return [
            'total' => Task::count(),
            'todo' => Task::where('status', 'todo')->count(),
            'in_progress' => Task::where('status', 'in_progress')->count(),
            'completed' => Task::where('status', 'completed')->count(),
            'urgent' => Task::where('priority', 'urgent')->count(),
            'overdue' => Task::whereDate('due_date', '<', $today)
                ->where('status', '<>', 'completed')
                ->count(),
        ];
    }

    private function analytics(Carbon $startOfYear): array
    {
        $documentsByMonth = Document::selectRaw('MONTH(created_at) as month, SUM(total_ttc) as total')
            ->where('created_at', '>=', $startOfYear)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->pluck('total', 'month');

        $documentsByType = Document::selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        return [
            'revenue_by_month' => collect(range(1, 12))->map(fn ($month) => [
                'month' => $month,
                'label' => Carbon::create()->month($month)->translatedFormat('M'),
                'total' => (float) ($documentsByMonth[$month] ?? 0),
            ])->values(),
            'documents_by_type' => [
                'facture' => (int) ($documentsByType['facture'] ?? 0),
                'devis' => (int) ($documentsByType['devis'] ?? 0),
                'bon_livraison' => (int) ($documentsByType['bon_livraison'] ?? 0),
            ],
        ];
    }

    private function recentDocuments()
    {
        return Document::with('client:id,nom_complet,nom_entreprise')
            ->latest()
            ->limit(6)
            ->get(['id', 'client_id', 'numero', 'type', 'statut', 'statut_paiement', 'total_ttc', 'reste_a_payer', 'created_at']);
    }

    private function recentUsers()
    {
        $columns = ['id', 'name', 'email', 'email_verified_at', 'created_at'];

        if (Schema::hasColumn('users', 'company_id')) {
            $columns[] = 'company_id';
        }

        return User::latest()
            ->limit(5)
            ->get($columns);
    }

    private function alerts(Carbon $today): array
    {
        return [
            'credits_en_retard' => Credit::whereDate('date_echeance', '<', $today)
                ->where('statut', '<>', 'solde')
                ->count(),
            'cheques_echeance_proche' => Cheque::whereBetween('date_echeance', [$today, $today->copy()->addDays(7)])
                ->where('statut', 'non_encaisse')
                ->count(),
            'documents_impayes' => Document::where('statut_paiement', '<>', 'paye')->count(),
            'stock_faible' => Product::whereRaw('quantite_stock < COALESCE(seuil_alerte_stock, 10)')->count(),
        ];
    }
}
