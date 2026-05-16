import { useState, useEffect, useCallback } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import styles from "./NotificationsPage.module.css";

/* ── Icons ───────────────────────────────────────────────────────────────── */
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const CheckAllIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L7 17l-5-5"/><path d="M23 6l-11 11"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

/* ── Métadonnées par type ────────────────────────────────────────────────── */
const TYPE_META = {
  task:     { label: "Tache",    color: "green",  emoji: "TA" },
  cheque:   { label: "Chèque",   color: "purple", emoji: "💳" },
  credit:   { label: "Crédit",   color: "cyan",   emoji: "💰" },
  stock:    { label: "Stock",    color: "amber",  emoji: "📦" },
  document: { label: "Document", color: "blue",   emoji: "📄" },
  default:  { label: "Système",  color: "gray",   emoji: "🔔" },
};

const NIVEAU_META = {
  info:    { color: "cyan",   label: "Info"    },
  warning: { color: "amber",  label: "Alerte"  },
  critique:{ color: "red",    label: "Urgent"  },
  danger:  { color: "red",    label: "Urgent"  },
  success: { color: "green",  label: "Succès"  },
};

const FILTER_TABS = [
  { key: "",         label: "Toutes"    },
  { key: "non_lues", label: "Non lues"  },
  { key: "cheque",   label: "Chèques"   },
  { key: "stock",    label: "Stock"     },
  { key: "credit",   label: "Crédits"   },
  { key: "document", label: "Documents" },
  { key: "task",     label: "Taches"    },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function NotificationsPage() {
  const {
    notifications, nonLuesCount, pagination,
    fetchLoading, markReadLoading, markAllLoading,
    deleteLoading, deleteAllLoading,
    fetchNotifications, markNotificationAsRead,
    markAllNotificationsAsRead, deleteNotification, deleteAllNotifications,
  } = useNotifications();

  const [activeTab,     setActiveTab]     = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [notification,  setNotification]  = useState(null);

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const buildParams = useCallback((tab, page = 1) => {
    const params = { page };
    if (tab === "non_lues") params.non_lues = true;
    else if (tab)           params.type     = tab;
    return params;
  }, []);

  const load = useCallback(
    (page = 1) => fetchNotifications(buildParams(activeTab, page)),
    [activeTab] // eslint-disable-line
  );

  useEffect(() => { load(1); }, [activeTab]); // eslint-disable-line

  /* ── Notification toast ───────────────────────────────────────────────── */
  const notify = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  /* ── Actions ──────────────────────────────────────────────────────────── */
  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
    } catch {
      notify("error", "Erreur lors de la mise à jour.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      notify("success", "Toutes les notifications marquées comme lues.");
    } catch {
      notify("error", "Erreur lors de la mise à jour.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
    } catch {
      notify("error", "Erreur lors de la suppression.");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setDeleteConfirm(false);
      notify("success", "Toutes les notifications supprimées.");
    } catch {
      setDeleteConfirm(false);
      notify("error", "Erreur lors de la suppression.");
    }
  };
  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className={styles.page}>

      {/* Toast */}
      {notification && (
        <div className={`${styles.toast} ${styles[`toast--${notification.type}`]}`}>
          <span className={styles.toastDot} />{notification.message}
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <div className={styles.pageIconWrapper}>
            <BellIcon />
            {nonLuesCount > 0 && (
              <span className={styles.pageIconBadge}>{nonLuesCount > 99 ? "99+" : nonLuesCount}</span>
            )}
          </div>
          <div>
            <h1 className={styles.pageTitle}>Notifications</h1>
            <p className={styles.pageSubtitle}>
              {nonLuesCount > 0
                ? `${nonLuesCount} non lue${nonLuesCount > 1 ? "s" : ""}`
                : "Tout est à jour"}
            </p>
          </div>
        </div>

        <div className={styles.pageActions}>
          {nonLuesCount > 0 && (
            <button
              className={styles.btnMarkAll}
              onClick={handleMarkAllRead}
              disabled={markAllLoading}
            >
              <CheckAllIcon />
              {markAllLoading ? "…" : "Tout marquer lu"}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className={styles.btnDeleteAll}
              onClick={() => setDeleteConfirm(true)}
              disabled={deleteAllLoading}
            >
              <TrashIcon />
              Tout supprimer
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs filtre ─────────────────────────────────────────────────── */}
      <div className={styles.tabs}>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === "non_lues" && nonLuesCount > 0 && (
              <span className={styles.tabBadge}>{nonLuesCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Contenu ─────────────────────────────────────────────────────── */}
      <div className={styles.content}>
        {fetchLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <span>Chargement…</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><BellIcon /></div>
            <h3 className={styles.emptyTitle}>Aucune notification</h3>
            <p className={styles.emptyMsg}>
              {activeTab === "non_lues"
                ? "Vous avez lu toutes vos notifications."
                : "Vous n'avez aucune notification pour le moment."}
            </p>
          </div>
        ) : (
          <div className={styles.notifList}>
            {notifications.map((notif) => (
              <NotifCard
                key={notif.id}
                notif={notif}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                markReadLoading={markReadLoading}
                deleteLoading={deleteLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {pagination.lastPage > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={pagination.currentPage <= 1 || fetchLoading}
            onClick={() => load(pagination.currentPage - 1)}
          >
            <ChevronLeftIcon />
          </button>
          <span className={styles.pageInfo}>
            Page {pagination.currentPage} / {pagination.lastPage}
          </span>
          <button
            className={styles.pageBtn}
            disabled={pagination.currentPage >= pagination.lastPage || fetchLoading}
            onClick={() => load(pagination.currentPage + 1)}
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}

      {/* ── Confirm suppression totale ───────────────────────────────────── */}
      {deleteConfirm && (
        <div className={styles.backdrop}>
          <div className={styles.confirmCard}>
            <div className={styles.confirmIcon}><TrashIcon /></div>
            <h3 className={styles.confirmTitle}>Tout supprimer ?</h3>
            <p className={styles.confirmMsg}>
              Cette action supprime toutes vos notifications de façon définitive.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteConfirm(false)}
                disabled={deleteAllLoading}
              >
                Annuler
              </button>
              <button
                className={styles.deleteBtn}
                onClick={handleDeleteAll}
                disabled={deleteAllLoading}
              >
                {deleteAllLoading ? "Suppression…" : "Supprimer tout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Composant card notification
═══════════════════════════════════════════════════════════════════════════ */
function NotifCard({ notif, onMarkRead, onDelete, markReadLoading, deleteLoading }) {
  const typeMeta   = TYPE_META[notif.type]   || TYPE_META.default;
  const niveauMeta = NIVEAU_META[notif.niveau] || NIVEAU_META.info;

  return (
    <div className={`${styles.notifCard} ${!notif.lu ? styles.notifCardUnread : ""}`}>

      {/* Indicateur non lu */}
      {!notif.lu && <span className={styles.unreadDot} />}

      {/* Icône type */}
      <div className={`${styles.notifEmoji} ${styles[`notifEmoji--${typeMeta.color}`]}`}>
        {typeMeta.emoji}
      </div>

      {/* Contenu */}
      <div className={styles.notifContent}>
        <div className={styles.notifTop}>
          <div className={styles.notifBadges}>
            <span className={`${styles.badge} ${styles[`badge--${typeMeta.color}`]}`}>
              {typeMeta.label}
            </span>
            <span className={`${styles.badge} ${styles[`badge--${niveauMeta.color}`]}`}>
              {niveauMeta.label}
            </span>
          </div>
          <span className={styles.notifTime}>{notif.created_at}</span>
        </div>
        <p className={styles.notifMessage}>{notif.message}</p>
      </div>

      {/* Actions */}
      <div className={styles.notifActions}>
        {!notif.lu && (
          <button
            className={styles.actionBtnRead}
            onClick={() => onMarkRead(notif.id)}
            disabled={markReadLoading}
            title="Marquer comme lu"
          >
            <CheckIcon />
          </button>
        )}
        <button
          className={styles.actionBtnDelete}
          onClick={() => onDelete(notif.id)}
          disabled={deleteLoading}
          title="Supprimer"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
