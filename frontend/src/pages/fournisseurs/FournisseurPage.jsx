import { useState, useEffect, useCallback } from "react";
import { useFournisseur } from "../../hooks/useFournisseur";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import FilterPanel from "../../components/common/FilterPanel";
import FournisseurModal from "./components/FournisseurModal/FournisseurModal";
import FournisseurStats from "./components/FournisseurStats/FournisseurStats";
import styles from "./FournisseurPage.module.css";

/* ── Icons inline ────────────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/* ── Constantes ──────────────────────────────────────────────────────────── */
const FILTER_FIELDS = [
  { key: "search", label: "Recherche", type: "text", placeholder: "Nom, email, ICE…" },
  {
    key: "actif", label: "Statut", type: "select",
    options: [
      { value: "true",  label: "Actif"   },
      { value: "false", label: "Inactif" },
    ],
  },
  { key: "ville", label: "Ville", type: "text", placeholder: "Ex : Tanger" },
  {
    key: "per_page", label: "Par page", type: "select",
    options: [
      { value: "10", label: "10" },
      { value: "25", label: "25" },
      { value: "50", label: "50" },
    ],
  },
];

const COLUMNS = [
  {
    key: "nom", label: "Fournisseur", width: "22%",
    render: (val, row) => (
      <div className={styles.cellName}>
        <div className={styles.avatar}>
          {val?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <div className={styles.nameText}>{val}</div>
          {row.contact_nom && (
            <div className={styles.nameSubtext}>{row.contact_nom}</div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "email", label: "Email", width: "20%",
    render: (val) =>
      val
        ? <a href={`mailto:${val}`} className={styles.emailLink}>{val}</a>
        : <span className={styles.empty}>—</span>,
  },
  {
    key: "telephone", label: "Téléphone", width: "13%",
    render: (val) => val || <span className={styles.empty}>—</span>,
  },
  {
    key: "ville", label: "Ville", width: "12%",
    render: (val) =>
      val
        ? <span className={styles.villeTag}>{val}</span>
        : <span className={styles.empty}>—</span>,
  },
  {
    key: "ice", label: "ICE", width: "13%",
    render: (val) =>
      val
        ? <code className={styles.iceCode}>{val}</code>
        : <span className={styles.empty}>—</span>,
  },
  {
    key: "actif", label: "Statut", width: "10%",
    render: (val) => (
      <span className={val ? styles.badgeActive : styles.badgeInactive}>
        <span className={styles.dot} />
        {val ? "Actif" : "Inactif"}
      </span>
    ),
  },
];

export default function FournisseurPage() {
  const {
    globalstats,
    fournisseurs, pagination, total,
    fetchLoading, createLoading, updateLoading, deleteLoading,
    fetchFournisseurs, createFournisseur, updateFournisseur, deleteFournisseur,
  } = useFournisseur();

  const [filters,       setFilters]       = useState({ per_page: "10" });
  const [modal,         setModal]         = useState({ open: false, mode: null, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification,  setNotification]  = useState(null);

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const load = useCallback(
    (page = 1) => fetchFournisseurs({ ...filters, page }),
    [filters] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Reload page 1 à chaque changement de filtre
  useEffect(() => { load(1); }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Notification helper ──────────────────────────────────────────────── */
  const notify = useCallback((type, message, duration = 3500) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  }, []);

  const openCreate = () => setModal({ open: true, mode: "create", data: null });
  const openEdit   = (row) => setModal({ open: true, mode: "edit", data: row });
  const openView   = (row) => setModal({ open: true, mode: "view", data: row });
  const closeModal = () => setModal({ open: false, mode: null, data: null });

  // ✅ handleSubmit : flux séquentiel garanti grâce à .unwrap() dans le hook
  //
  //   1. await create/update  → throw si erreur backend (422, 500…)
  //   2. closeModal()         → seulement si l'étape 1 a réussi
  //   3. await load()         → refetch la page courante → table à jour sans refresh
  //
  //   En cas d'erreur : catch attrape le reject, le modal reste ouvert,
  //   un toast d'erreur s'affiche avec le message Laravel.
const handleSubmit = async (payload) => {
  try {
    if (modal.mode === "create") {
      await createFournisseur(payload);
      notify("success", "Fournisseur créé avec succès.");
      
      // ✅ ON NE TOUCHE PAS à setFilters ici pour garder la ville saisie
      closeModal();
      
      // ✅ On recharge simplement la page 1 avec les filtres existants
      await load(1); 
    } else {
      await updateFournisseur(modal.data.id, payload);
      notify("success", "Fournisseur mis à jour avec succès.");

      closeModal();
      // ✅ On reste sur la page actuelle pour ne pas perdre l'utilisateur
      await load(pagination.currentPage);
    }
  } catch (err) {
    const msg = err?.errors
      ? Object.values(err.errors).flat().join(" — ")
      : err?.message || "Une erreur est survenue.";
    notify("error", msg, 5000);
  }
};
  /* ── Delete ───────────────────────────────────────────────────────────── */
  const handleDeleteRequest = (row) => setDeleteConfirm(row);

  // ✅ handleDeleteConfirm : même logique — refetch immédiat après suppression
  //    Gère aussi le cas où on supprime le dernier élément d'une page > 1
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const nom = deleteConfirm.nom;
    try {
      await deleteFournisseur(deleteConfirm.id);
      setDeleteConfirm(null);
      notify("success", `"${nom}" supprimé avec succès.`);

      const newTotal   = total - 1;
      const perPage    = Number(filters.per_page) || 10;
      const maxPage    = Math.max(1, Math.ceil(newTotal / perPage));
      const targetPage = Math.min(pagination.currentPage, maxPage);
      await load(targetPage);
    } catch (err) {
      setDeleteConfirm(null);
      notify("error", err?.message || "Erreur lors de la suppression.", 4000);
    }
  };

  const tableActions = [
    { key: "view",   label: "Voir",      icon: <EyeIcon />,   onClick: openView          },
    { key: "edit",   label: "Modifier",  icon: <EditIcon />,  onClick: openEdit          },
    { key: "delete", label: "Supprimer", icon: <TrashIcon />, onClick: handleDeleteRequest },
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

      {/* Toast notification */}
      {notification && (
        <div className={`${styles.toast} ${styles[`toast--${notification.type}`]}`}>
          <span className={styles.toastDot} />
          {notification.message}
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Fournisseurs"
        subtitle={`${total} fournisseur${total !== 1 ? "s" : ""} enregistré${total !== 1 ? "s" : ""}`}
        actions={
          <button className={styles.createBtn} onClick={openCreate} disabled={createLoading}>
            <PlusIcon />
            Nouveau fournisseur
          </button>
        }
      />

      {/* Stats */}
      <FournisseurStats globalstats={globalstats} />

      {/* Filters */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ per_page: "10" })}
        filterFields={FILTER_FIELDS}
      />

      <div className={styles.tableSection}>
        <DataTable
          columns={COLUMNS}
          data={fournisseurs}
          loading={fetchLoading}
          actions={tableActions}
          pagination={paginationProps}
        />
      </div>

      {/* Modal create / edit / view */}
      {modal.open && (
        <FournisseurModal
          mode={modal.mode}
          initialData={modal.data}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={modal.mode === "create" ? createLoading : updateLoading}
        />
      )}

      {/* Confirmation suppression */}
      {deleteConfirm && (
        <div className={styles.backdropDelete}>
          <div className={styles.deleteCard}>
            <div className={styles.deleteIcon}>
              <TrashIcon />
            </div>
            <h3 className={styles.deleteTitle}>Confirmer la suppression</h3>
            <p className={styles.deleteMsg}>
              Voulez-vous vraiment supprimer{" "}
              <strong>{deleteConfirm.nom}</strong> ?
              Cette action est irréversible.
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