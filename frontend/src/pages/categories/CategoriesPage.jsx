import { useState, useEffect, useCallback } from "react";
import { useCategories } from "../../hooks/useCategories";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import FilterPanel from "../../components/common/FilterPanel";
import CategoryModal from "./components/CategoryModal/CategoryModal";
import CategoryStats from "./components/CategoryStats/CategoryStats";
import styles from "./CategoriesPage.module.css";

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
const ToggleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="16" cy="12" r="3"/>
  </svg>
);

/* ── Constantes ──────────────────────────────────────────────────────────── */
const FILTER_FIELDS = [
  { key: "search",    label: "Recherche",  type: "text",   placeholder: "Nom ou description…" },
  { key: "status",    label: "Statut",     type: "select",
    options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
  { key: "sort_by",   label: "Trier par",  type: "select",
    options: [
      { value: "created_at",    label: "Date création" },
      { value: "name",          label: "Nom" },
      { value: "products_count",label: "Nb produits" },
    ],
  },
  {key : "sort_order", label: "Ordre",      type: "select",
    options: [
      { value: "asc",  label: "Ascendant" },
      { value: "desc", label: "Descendant" },
    ],
  },
  { key: "per_page",  label: "Par page",   type: "select",
    options: [{ value: "10", label: "10" }, { value: "25", label: "25" }, { value: "50", label: "50" }],
  },
];

const COLUMNS = [
  {
    key: "name", label: "Catégorie", width: "30%",
    render: (val, row) => (
      <div className={styles.cellName}>
        <div className={styles.avatar}>
          {val?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <div className={styles.nameText}>{val}</div>
          {row.description && (
            <div className={styles.nameSubtext}>
              {row.description.length > 50
                ? row.description.slice(0, 50) + "…"
                : row.description}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "products_count", label: "Produits", width: "15%",
    render: (val) => (
      <span className={styles.productsBadge}>
        {val ?? 0}
      </span>
    ),
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
    render: (val) =>
      val
        ? new Date(val).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
        : <span className={styles.empty}>—</span>,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function CategoriesPage() {
  const {
    categories, pagination, total, stats,
    fetchLoading, createLoading, updateLoading, deleteLoading,
    fetchCategories, createCategory, updateCategory, deleteCategory,
  } = useCategories();

  const [filters,       setFilters]       = useState({ per_page: "10", sort_by: "created_at" });
  const [modal,         setModal]         = useState({ open: false, mode: null, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification,  setNotification]  = useState(null);

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const load = useCallback(
    (page = 1) => fetchCategories({ ...filters, page }),
    [filters] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => { load(1); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Notification ─────────────────────────────────────────────────────── */
  const notify = useCallback((type, message, duration = 3500) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  }, []);

  /* ── Modal handlers ───────────────────────────────────────────────────── */
  const openCreate = () => setModal({ open: true, mode: "create", data: null });
  const openEdit   = (row) => setModal({ open: true, mode: "edit", data: row });
  const openView   = (row) => setModal({ open: true, mode: "view", data: row });
  const closeModal = () => setModal({ open: false, mode: null, data: null });

  const handleSubmit = async (payload) => {
    try {
      if (modal.mode === "create") {
        await createCategory(payload);
        notify("success", "Catégorie créée avec succès.");
      } else {
        await updateCategory(modal.data.id, payload);
        notify("success", "Catégorie mise à jour avec succès.");
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

  /* ── Delete ───────────────────────────────────────────────────────────── */
  const handleDeleteRequest = (row) => setDeleteConfirm(row);
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const nom = deleteConfirm.name;
    try {
      await deleteCategory(deleteConfirm.id);
      setDeleteConfirm(null);
      notify("success", `"${nom}" supprimée avec succès.`);
      const newTotal   = total - 1;
      const perPage    = Number(filters.per_page) || 10;
      const maxPage    = Math.max(1, Math.ceil(newTotal / perPage));
      const targetPage = Math.min(pagination.currentPage, maxPage);
      await load(targetPage);
    } catch (err) {
      setDeleteConfirm(null);
      // ✅ Cas spécial 409 : catégorie avec produits
      const msg = err?.message || "Erreur lors de la suppression.";
      notify("error", msg, 5000);
    }
  };

  /* ── Table ────────────────────────────────────────────────────────────── */
  const tableActions = [
    { key: "view",   label: "Voir",      icon: <EyeIcon />,    onClick: openView           },
    { key: "edit",   label: "Modifier",  icon: <EditIcon />,   onClick: openEdit           },
    { key: "delete", label: "Supprimer", icon: <TrashIcon />,  onClick: handleDeleteRequest },
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

      {/* Toast */}
      {notification && (
        <div className={`${styles.toast} ${styles[`toast--${notification.type}`]}`}>
          <span className={styles.toastDot} />
          {notification.message}
        </div>
      )}

      <PageHeader
        title="Catégories"
        subtitle={`${total} catégorie${total !== 1 ? "s" : ""} enregistrée${total !== 1 ? "s" : ""}`}
        actions={
          <button className={styles.createBtn} onClick={openCreate} disabled={createLoading}>
            <PlusIcon />
            Nouvelle catégorie
          </button>
        }
      />

      {/* Stats — viennent du controller via state.stats */}
      <CategoryStats stats={stats} categories={categories} />

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ per_page: "10", sort_by: "created_at" })}
        filterFields={FILTER_FIELDS}
      />

      <div className={styles.tableSection}>
        <DataTable
          columns={COLUMNS}
          data={categories}
          loading={fetchLoading}
          actions={tableActions}
          pagination={paginationProps}
        />
      </div>

      {modal.open && (
        <CategoryModal
          mode={modal.mode}
          initialData={modal.data}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={modal.mode === "create" ? createLoading : updateLoading}
        />
      )}

      {/* Delete confirmation — affiche le nombre de produits si 409 */}
      {deleteConfirm && (
        <div className={styles.backdropDelete}>
          <div className={styles.deleteCard}>
            <div className={styles.deleteIcon}><TrashIcon /></div>
            <h3 className={styles.deleteTitle}>Confirmer la suppression</h3>
            <p className={styles.deleteMsg}>
              Voulez-vous vraiment supprimer{" "}
              <strong>{deleteConfirm.name}</strong> ?
              {deleteConfirm.products_count > 0 && (
                <span className={styles.deleteWarning}>
                  <br />⚠ Cette catégorie contient{" "}
                  <strong>{deleteConfirm.products_count} produit{deleteConfirm.products_count > 1 ? "s" : ""}</strong>.
                  La suppression sera bloquée.
                </span>
              )}
            </p>
            <div className={styles.deleteActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                className={styles.deleteBtn}
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}