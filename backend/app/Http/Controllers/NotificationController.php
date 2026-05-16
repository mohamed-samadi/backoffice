<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    // ─── GET /api/notifications ───────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $perPage       = min((int) $request->get('per_page', 20), 100);
        $filtre        = $request->get('type');      // cheque|credit|stock|document
        $nonLues       = $request->boolean('non_lues');

        $query = $this->notificationsQuery($request);

        if ($filtre) {
            $query->where('data->type', $filtre);
        }

        if ($nonLues) {
            $query->whereNull('read_at');
        }

        $notifications = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $notifications->map(fn($n) => [
                'id'         => $n->id,
                'type'       => $n->data['type'],
                'niveau'     => $n->data['niveau'],
                'message'    => $n->data['message'],
                'data'       => $n->data,
                'lu'         => !is_null($n->read_at),
                'created_at' => $n->created_at->diffForHumans(),
            ]),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'total'        => $notifications->total(),
                'per_page'     => $notifications->perPage(),
            ],
            'non_lues_count' => $this->unreadNotificationsQuery($request)->count(),
        ]);
    }

    // ─── POST /api/notifications/{id}/read ────────────────────────────────
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $this->notificationsQuery($request)
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue',
        ]);
    }

    // ─── POST /api/notifications/read-all ─────────────────────────────────
    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->unreadNotificationsQuery($request)->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications marquées comme lues',
        ]);
    }

    // ─── DELETE /api/notifications/{id} ───────────────────────────────────
    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->notificationsQuery($request)
            ->findOrFail($id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notification supprimée',
        ]);
    }

    // ─── DELETE /api/notifications ────────────────────────────────────────
    public function destroyAll(Request $request): JsonResponse
    {
        $this->notificationsQuery($request)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications supprimées',
        ]);
    }

    // ─── GET /api/notifications/count ─────────────────────────────────────
    public function count(Request $request): JsonResponse
    {
        return response()->json([
            'success'        => true,
            'non_lues_count' => $this->unreadNotificationsQuery($request)->count(),
        ]);
    }

    private function notificationsQuery(Request $request): Builder
    {
        $user = $request->user();

        if ($user) {
            return $user->notifications()->getQuery();
        }

        return DatabaseNotification::query();
    }

    private function unreadNotificationsQuery(Request $request): Builder
    {
        return $this->notificationsQuery($request)->whereNull('read_at');
    }
}
