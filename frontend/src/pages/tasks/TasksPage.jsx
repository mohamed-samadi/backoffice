import { useState, useEffect, useCallback } from "react";
import { useTasks } from "../../hooks/useTasks";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import FilterPanel from "../../components/common/FilterPanel";
import TaskModal from "./components/TaskModal/TaskModal";
import TaskStats from "./components/TaskStats/TaskStats";
import styles from "./TasksPage.module.css";
import axios from "axios";

/* ── Icons ───────────────────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

/* ── Constantes ──────────────────────────────────────────────────────────── */
const PRIORITY_META = {
  low:    { label: "Faible",  color: "var(--color-text-muted)" },
  normal: { label: "Normal",  color: "var(--color-cyan)"       },
  high:   { label: "Élevée",  color: "var(--color-amber)"      },
  urgent: { label: "Urgente", color: "var(--color-red)"        },
};

const STATUS_META = {
  todo:        { label: "À faire",  color: "purple" },
  in_progress: { label: "En cours", color: "cyan"   },
  completed:   { label: "Terminée", color: "green"  },
};

const FILTER_FIELDS = [
  { key: "search",   label: "Recherche",  type: "text",   placeholder: "Titre ou notes…" },
  { key: "status",   label: "Statut",     type: "select",
    options: [
      { value: "todo",        label: "À faire"  },
      { value: "in_progress", label: "En cours" },
      { value: "completed",   label: "Terminée" },
    ],
  },
  { key: "priority", label: "Priorité",   type: "select",
    options: [
      { value: "low",    label: "Faible"  },
      { value: "normal", label: "Normal"  },
      { value: "high",   label: "Élevée"  },
      { value: "urgent", label: "Urgente" },
    ],
  },
  { key: "task_category_id", label: "Catégorie", type: "select", options: [] },
  { key: "due_date_from",    label: "Échéance du", type: "text",   placeholder: "AAAA-MM-JJ" },
  { key: "due_date_to",      label: "Au",          type: "text",   placeholder: "AAAA-MM-JJ" },
  { key: "sort_by",          label: "Trier par",   type: "select",
    options: [
      { value: "created_at", label: "Date création" },
      { value: "due_date",   label: "Échéance"      },
      { value: "priority",   label: "Priorité"      },
      { value: "status",     label: "Statut"        },
      { value: "title",      label: "Titre"         },
    ],
  },
  { key: "per_page", label: "Par page", type: "select",
    options: [{ value: "10", label: "10" }, { value: "25", label: "25" }, { value: "50", label: "50" }],
  },
];

const COLUMNS = [
  {
    key: "title", label: "Tâche", width: "30%",
    render: (val, row) => (
      <div className={styles.cellTitle}>
        <div className={styles.priorityBar} style={{ background: PRIORITY_META[row.priority]?.color }} />
        <div>
          <div className={styles.titleText}>{val}</div>
          {row.category?.name && (
            <div className={styles.titleSub} style={{ color: row.category?.color || "var(--color-text-muted)" }}>
              {row.category.color && (
                <span className={styles.catDot} style={{ background: row.category.color }} />
              )}
              {row.category.name}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "status", label: "Statut", width: "13%",
    render: (val) => {
      const meta = STATUS_META[val] || { label: val, color: "accent" };
      return (
        <span className={`${styles.statusBadge} ${styles[`status--${meta.color}`]}`}>
          <span className={styles.dot} />
          {meta.label}
        </span>
      );
    },
  },
  {
    key: "priority", label: "Priorité", width: "12%",
    render: (val) => {
      const meta = PRIORITY_META[val] || { label: val, color: "var(--color-text-muted)" };
      return (
        <span className={styles.priorityTag} style={{ color: meta.color }}>
          <span className={styles.priorityDot} style={{ background: meta.color }} />
          {meta.label}
        </span>
      );
    },
  },
  {
    key: "due_date", label: "Échéance", width: "14%",
    render: (val, row) => {
      if (!val) return <span className={styles.empty}>—</span>;
      const isOverdue = new Date(val) < new Date() && row.status !== "completed";
      return (
        <span className={isOverdue ? styles.dueDateOverdue : styles.dueDate}>
          {new Date(val).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      );
    },
  },
  {
    key: "client", label: "Client", width: "16%",
    render: (val) => val?.nom
      ? <span className={styles.clientText}>{val.nom}</span>
      : <span className={styles.empty}>—</span>,
  },
  {
    key: "created_at", label: "Créée le", width: "13%",
    render: (val) => val
      ? new Date(val).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
      : <span className={styles.empty}>—</span>,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function TasksPage() {
  const {
    tasks, pagination, total, stats, activeCategories,
    fetchLoading, createLoading, updateLoading, deleteLoading,
    fetchTasks, createTask, updateTask, deleteTask,
    fetchActiveTaskCategories, updateTaskStatus, updateStatusLoading,
  } = useTasks();

  const [filters,       setFilters]       = useState({ per_page: "10", sort_by: "created_at" });
  const [modal,         setModal]         = useState({ open: false, mode: null, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification,  setNotification]  = useState(null);

  /* ── Charger les catégories pour le filtre ────────────────────────────── */
  useEffect(() => { fetchActiveTaskCategories(); }, []); // eslint-disable-line
  const [clients, setClients] = useState([]);

useEffect(() => {

  async function getClients() {

    try {

      const response = await axios.get(
        "http://localhost:8000/api/clients/active"
      );

      setClients(response.data.data);

    } catch (error) {

      console.log(error);

    }
  }

  getClients();

}, []);

  /* ── Injecter les catégories dans les filtres ─────────────────────────── */
  const filterFields = FILTER_FIELDS.map((f) =>
    f.key === "task_category_id"
      ? { ...f, options: activeCategories.map((c) => ({ value: String(c.id), label: c.name })) }
      : f
  );

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const load = useCallback(
    (page = 1) => fetchTasks({ ...filters, page }),
    [filters] // eslint-disable-line
  );

  useEffect(() => { load(1); }, [filters]); // eslint-disable-line

  /* ── Notification ─────────────────────────────────────────────────────── */
  const notify = useCallback((type, message, duration = 3500) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  }, []);

  const openCreate = () => setModal({ open: true, mode: "create", data: null });
  const openEdit   = (row) => setModal({ open: true, mode: "edit",   data: row });
  const openView   = (row) => setModal({ open: true, mode: "view",   data: row });
  const closeModal = () => setModal({ open: false, mode: null, data: null });

  const handleSubmit = async (payload) => {
    try {
      if (modal.mode === "create") {
        await createTask(payload);
        notify("success", "Tâche créée avec succès.");
      } else {
        await updateTask(modal.data.id, payload);
        notify("success", "Tâche mise à jour avec succès.");
      }
      closeModal();
      await load(pagination.currentPage);
    } catch (err) {
      const msg = err?.errors
        ? Object.values(err.errors).flat().join(" — ")
        : err?.message || "Une erreur est survenue.";
      notify("error", msg, 5000);
    }
  };

  /* ── Status rapide ────────────────────────────────────────────────────── */
  const handleStatusChange = async (row, newStatus) => {
    try {
      await updateTaskStatus(row.id, newStatus);
      notify("success", "Statut mis à jour.");
      await load(pagination.currentPage);
    } catch {
      notify("error", "Erreur lors de la mise à jour du statut.", 4000);
    }
  };

  /* ── Delete ───────────────────────────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteTask(deleteConfirm.id);
      setDeleteConfirm(null);
      notify("success", `"${deleteConfirm.title}" supprimée.`);
      const newTotal   = total - 1;
      const perPage    = Number(filters.per_page) || 10;
      const maxPage    = Math.max(1, Math.ceil(newTotal / perPage));
      const targetPage = Math.min(pagination.currentPage, maxPage);
      await load(targetPage);
    } catch (err) {
      setDeleteConfirm(null);
      notify("error", err?.message || "Erreur lors de la suppression.", 5000);
    }
  };

  /* ── Table ────────────────────────────────────────────────────────────── */
  const tableActions = [
    { key: "view",   label: "Voir",      icon: <EyeIcon />,   onClick: openView                           },
    { key: "edit",   label: "Modifier",  icon: <EditIcon />,  onClick: openEdit                           },
    { key: "delete", label: "Supprimer", icon: <TrashIcon />, onClick: (row) => setDeleteConfirm(row)     },
  ];

  const paginationProps = {
    currentPage: pagination.currentPage,
    totalPages:  pagination.lastPage,
    hasPrev:     pagination.currentPage > 1,
    hasNext:     pagination.currentPage < pagination.lastPage,
    onPrev:      () => load(pagination.currentPage - 1),
    onNext:      () => load(pagination.currentPage + 1),
  };

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className={styles.page}>

      {notification && (
        <div className={`${styles.toast} ${styles[`toast--${notification.type}`]}`}>
          <span className={styles.toastDot} />
          {notification.message}
        </div>
      )}

      <PageHeader
        title="Tâches"
        subtitle={`${total} tâche${total !== 1 ? "s" : ""} enregistrée${total !== 1 ? "s" : ""}`}
        actions={
          <button className={styles.createBtn} onClick={openCreate} disabled={createLoading}>
            <PlusIcon />
            Nouvelle tâche
          </button>
        }
      />

      <TaskStats stats={stats} />

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ per_page: "10", sort_by: "created_at" })}
        filterFields={filterFields}
      />

      <div className={styles.tableSection}>
        <DataTable
          columns={COLUMNS}
          data={tasks}
          loading={fetchLoading}
          actions={tableActions}
          pagination={paginationProps}
        />
      </div>

      {modal.open && (
        <TaskModal
          mode={modal.mode}
          initialData={modal.data}
          categories={activeCategories}
          clients={clients}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={modal.mode === "create" ? createLoading : updateLoading}
        />
      )}

      {deleteConfirm && (
        <div className={styles.backdropDelete}>
          <div className={styles.deleteCard}>
            <div className={styles.deleteIcon}><TrashIcon /></div>
            <h3 className={styles.deleteTitle}>Confirmer la suppression</h3>
            <p className={styles.deleteMsg}>
              Voulez-vous vraiment supprimer{" "}
              <strong>{deleteConfirm.title}</strong> ?
            </p>
            <div className={styles.deleteActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)} disabled={deleteLoading}>
                Annuler
              </button>
              <button className={styles.deleteBtn} onClick={handleDeleteConfirm} disabled={deleteLoading}>
                {deleteLoading ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}