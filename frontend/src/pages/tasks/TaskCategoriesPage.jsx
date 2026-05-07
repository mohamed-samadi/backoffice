import { useState, useEffect, useCallback } from "react";
import { useTasks } from "../../hooks/useTasks";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import TaskCategoryModal from "../tasks/components/TaskCategoryModal/TaskCategoryModal";
import styles from "./TaskCategoriesPage.module.css";

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

const COLUMNS = [
  {
    key: "name", label: "Catégorie", width: "35%",
    render: (val, row) => (
      <div className={styles.cellName}>
        <div className={styles.colorDot} style={{ background: row.color || "var(--color-text-muted)" }} />
        <div>
          <div className={styles.nameText}>{val}</div>
          {row.description && (
            <div className={styles.nameSubtext}>
              {row.description.length > 55 ? row.description.slice(0, 55) + "…" : row.description}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "color", label: "Couleur", width: "15%",
    render: (val) => val
      ? (
        <div className={styles.colorPreview}>
          <span className={styles.colorSwatch} style={{ background: val }} />
          <code className={styles.colorCode}>{val}</code>
        </div>
      )
      : <span className={styles.empty}>—</span>,
  },
  {
    key: "is_active", label: "Statut", width: "15%",
    render: (val) => (
      <span className={val ? styles.badgeActive : styles.badgeInactive}>
        <span className={styles.dot} />
        {val ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "created_at", label: "Créée le", width: "18%",
    render: (val) => val
      ? new Date(val).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
      : <span className={styles.empty}>—</span>,
  },
];

export default function TaskCategoriesPage() {
  const {
    categories, fetchCategoriesLoading, createCategoryLoading,
    updateCategoryLoading, deleteCategoryLoading,
    fetchTaskCategories, createTaskCategory, updateTaskCategory, deleteTaskCategory,
  } = useTasks();

  const [modal,         setModal]         = useState({ open: false, mode: null, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification,  setNotification]  = useState(null);

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  useEffect(() => { fetchTaskCategories(); }, []); // eslint-disable-line

  /* ── Notification ─────────────────────────────────────────────────────── */
  const notify = useCallback((type, message, duration = 3500) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  }, []);

  /* ── Modal ────────────────────────────────────────────────────────────── */
  const openCreate = () => setModal({ open: true, mode: "create", data: null });
  const openEdit   = (row) => setModal({ open: true, mode: "edit", data: row });
  const openView   = (row) => setModal({ open: true, mode: "view", data: row });
  const closeModal = () => setModal({ open: false, mode: null, data: null });

  const handleSubmit = async (payload) => {
    try {
      if (modal.mode === "create") {
        await createTaskCategory(payload);
        notify("success", "Catégorie créée avec succès.");
      } else {
        await updateTaskCategory(modal.data.id, payload);
        notify("success", "Catégorie mise à jour avec succès.");
      }
      closeModal();
      await fetchTaskCategories();
    } catch (err) {
      const msg = err?.errors
        ? Object.values(err.errors).flat().join(" — ")
        : err?.message || "Une erreur est survenue.";
      notify("error", msg, 5000);
    }
  };

  /* ── Delete ───────────────────────────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteTaskCategory(deleteConfirm.id);
      setDeleteConfirm(null);
      notify("success", `"${deleteConfirm.name}" supprimée.`);
      await fetchTaskCategories();
    } catch (err) {
      setDeleteConfirm(null);
      notify("error", err?.message || "Erreur lors de la suppression.", 5000);
    }
  };

  const tableActions = [
    { key: "view",   label: "Voir",      icon: <EyeIcon />,   onClick: openView                       },
    { key: "edit",   label: "Modifier",  icon: <EditIcon />,  onClick: openEdit                       },
    { key: "delete", label: "Supprimer", icon: <TrashIcon />, onClick: (row) => setDeleteConfirm(row) },
  ];

  return (
    <div className={styles.page}>

      {notification && (
        <div className={`${styles.toast} ${styles[`toast--${notification.type}`]}`}>
          <span className={styles.toastDot} />
          {notification.message}
        </div>
      )}

      <PageHeader
        title="Catégories de tâches"
        subtitle={`${categories.length} catégorie${categories.length !== 1 ? "s" : ""}`}
        actions={
          <button className={styles.createBtn} onClick={openCreate} disabled={createCategoryLoading}>
            <PlusIcon />
            Nouvelle catégorie
          </button>
        }
      />

      <div className={styles.tableSection}>
        <DataTable
          columns={COLUMNS}
          data={categories}
          loading={fetchCategoriesLoading}
          actions={tableActions}
        />
      </div>

      {modal.open && (
        <TaskCategoryModal
          mode={modal.mode}
          initialData={modal.data}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={modal.mode === "create" ? createCategoryLoading : updateCategoryLoading}
        />
      )}

      {deleteConfirm && (
        <div className={styles.backdropDelete}>
          <div className={styles.deleteCard}>
            <div className={styles.deleteIcon}><TrashIcon /></div>
            <h3 className={styles.deleteTitle}>Confirmer la suppression</h3>
            <p className={styles.deleteMsg}>
              Voulez-vous vraiment supprimer{" "}
              <strong>{deleteConfirm.name}</strong> ?
              <span className={styles.deleteWarning}>
                <br />⚠ La suppression sera bloquée si des tâches utilisent cette catégorie.
              </span>
            </p>
            <div className={styles.deleteActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)} disabled={deleteCategoryLoading}>
                Annuler
              </button>
              <button className={styles.deleteBtn} onClick={handleDeleteConfirm} disabled={deleteCategoryLoading}>
                {deleteCategoryLoading ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}