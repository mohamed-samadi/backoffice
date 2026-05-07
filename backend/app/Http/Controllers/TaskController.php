<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;

class TaskController extends Controller
{
    /**
     * Liste des tâches avec filtres backend
     */
    public function index(Request $request): JsonResponse
    {
        // ─── Stats globales (1 requête) ───────────────────────────────────
        $stats = Task::selectRaw('
            count(*)                                        as total,
            sum(status = "todo")                            as todo,
            sum(status = "in_progress")                     as in_progress,
            sum(status = "completed")                       as completed,
            sum(priority = "urgent")                        as urgent,
            sum(due_date < NOW() AND status != "completed") as overdue
        ')->first();

        // ─── Paramètres ───────────────────────────────────────────────────
        $perPage   = min((int) $request->get('per_page', 10), 100);
        $search    = $request->get('search');
        $sortBy    = $request->get('sort_by', 'created_at');
        $sortOrder = in_array($request->get('sort_order', 'desc'), ['asc', 'desc'])
                        ? $request->get('sort_order', 'desc')
                        : 'desc';

        // ─── Query Builder ─────────────────────────────────────────────────
        $query = Task::query()->with([
            'category:id,name,color',
            'client:id,nom_complet',
            'user:id,name',
        ]);

        // 🔎 Recherche
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        // 🗂 Filtre catégorie
        if ($request->filled('task_category_id')) {
            $query->where('task_category_id', (int) $request->task_category_id);
        }

        // 👤 Filtre client
        if ($request->filled('client_id')) {
            $query->where('client_id', (int) $request->client_id);
        }

        // 👤 Filtre user assigné
        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->user_id);
        }

        // 📌 Filtre statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // 🚨 Filtre priorité
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // 📅 Filtre due_date min
        if ($request->filled('due_date_from')) {
            $query->whereDate('due_date', '>=', $request->due_date_from);
        }

        // 📅 Filtre due_date max
        if ($request->filled('due_date_to')) {
            $query->whereDate('due_date', '<=', $request->due_date_to);
        }

        // ⚠️ Filtre overdue uniquement
        if ($request->boolean('overdue')) {
            $query->where('due_date', '<', now())
                  ->where('status', '!=', 'completed');
        }

        // ─── Tri ──────────────────────────────────────────────────────────
        $allowed = ['title', 'priority', 'status', 'due_date', 'created_at'];
        if (in_array($sortBy, $allowed)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->latest();
        }

        $tasks = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'stats'   => $stats,
            'data'    => $tasks->items(),
            'meta'    => [
                'current_page' => $tasks->currentPage(),
                'last_page'    => $tasks->lastPage(),
                'total'        => $tasks->total(),
                'per_page'     => $tasks->perPage(),
            ],
            'message' => 'Liste des tâches récupérée avec succès',
        ], 200);
    }

    /**
     * Création tâche
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = Task::create($request->validated());
        $task->load(['category:id,name,color', 'client:id,nom_complet', 'user:id,name']);

        return response()->json([
            'success' => true,
            'data'    => $task,
            'message' => 'Tâche créée avec succès',
        ], 201);
    }

    /**
     * Détail tâche
     */
    public function show(Task $task): JsonResponse
    {
        $task->load(['category', 'client:id,nom_complet', 'user']);

        return response()->json([
            'success' => true,
            'data'    => $task,
            'message' => 'Tâche récupérée avec succès',
        ], 200);
    }

    /**
     * Mise à jour tâche
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $data = $request->validated();

        // ✅ Gérer les timestamps automatiques selon le statut
        if (isset($data['status'])) {
            if ($data['status'] === 'in_progress' && !$task->started_at) {
                $data['started_at'] = now();
            }
            if ($data['status'] === 'completed' && !$task->completed_at) {
                $data['completed_at'] = now();
            }
            // Reset si on repasse en todo
            if ($data['status'] === 'todo') {
                $data['started_at']   = null;
                $data['completed_at'] = null;
            }
        }

        $task->update($data);
        $task->load(['category:id,name,color', 'client:id,nom_complet', 'user:id,name']);

        return response()->json([
            'success' => true,
            'data'    => $task,
            'message' => 'Tâche mise à jour avec succès',
        ], 200);
    }

    /**
     * Suppression tâche
     */
    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json([
            'success' => true,
            'data'    => null,
            'message' => 'Tâche supprimée avec succès',
        ], 200);
    }

    /**
     * Changement rapide de statut (sans passer par le modal)
     */
    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:todo,in_progress,completed'],
        ]);

        $data = ['status' => $request->status];

        if ($request->status === 'in_progress' && !$task->started_at) {
            $data['started_at'] = now();
        }
        if ($request->status === 'completed' && !$task->completed_at) {
            $data['completed_at'] = now();
        }
        if ($request->status === 'todo') {
            $data['started_at']   = null;
            $data['completed_at'] = null;
        }

        $task->update($data);
        $task->load(['category:id,name,color', 'client:id,nom_complet', 'user:id,name']);

        return response()->json([
            'success' => true,
            'data'    => $task,
            'message' => 'Statut mis à jour avec succès',
        ], 200);
    }

    /**
     * Tâches en retard
     */
    public function overdue(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 10), 100);

        $tasks = Task::overdue()
            ->with(['category:id,name,color', 'client:id,nom_complet', 'user:id,name'])
            ->orderBy('due_date', 'asc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $tasks->items(),
            'meta'    => [
                'current_page' => $tasks->currentPage(),
                'last_page'    => $tasks->lastPage(),
                'total'        => $tasks->total(),
                'per_page'     => $tasks->perPage(),
            ],
            'message' => 'Tâches en retard récupérées avec succès',
        ], 200);
    }

    /**
     * Tâches par catégorie
     */
    public function byCategory(TaskCategory $taskCategory, Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 10), 100);

        $tasks = $taskCategory->tasks()
            ->with(['client:id,nom_complet', 'user:id,name'])
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $tasks->items(),
            'meta'    => [
                'current_page' => $tasks->currentPage(),
                'last_page'    => $tasks->lastPage(),
                'total'        => $tasks->total(),
                'per_page'     => $tasks->perPage(),
            ],
            'message' => "Tâches de la catégorie {$taskCategory->name}",
        ], 200);
    }
}