import { useState, useEffect, useCallback } from "react";
import { useClients } from "../../hooks/useClients";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import FilterPanel from "../../components/common/FilterPanel";
import ClientModal from "./components/ClientModal/ClientModal";
import ClientStats from "./components/ClientStats/ClientStats";
import styles from "./ClientsPage.module.css";
import {formatWhatsappPhone} from "../../utils/formatWhatsappPhone";
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


const FILTER_FIELDS = [
  { key: "search",   label: "Recherche",  type: "text",   placeholder: "Nom, entreprise, email…" },
  { key: "statut",   label: "Statut",     type: "select",
    options: [
      { value: "active",   label: "Actif"   },
      { value: "inactive", label: "Inactif" },
    ],
  },
  { key: "sort_by",  label: "Trier par",  type: "select",
    options: [
      { value: "created_at",    label: "Date création" },
      { value: "nom_complet",   label: "Nom"           },
      { value: "nom_entreprise",label: "Entreprise"    },
    ],
  },
  { key: "per_page", label: "Par page",   type: "select",
    options: [
      { value: "10", label: "10" },
      { value: "25", label: "25" },
      { value: "50", label: "50" },
    ],
  },
];

const COLUMNS = [
  {
    key: "nom_complet", label: "Client", width: "28%",
    render: (val, row) => (
      <div className={styles.cellClient}>
        <div className={`${styles.avatar} ${row.statut === "active" ? styles.avatarActive : styles.avatarInactive}`}>
          {val?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <div className={styles.clientName}>{val}</div>
          {row.nom_entreprise && (
            <div className={styles.clientSub}>{row.nom_entreprise}</div>
          )}
        </div>
      </div>
    ),
  },
{
  key: "telephone",
  label: "Téléphone",
  width: "16%",

  render: (val) => val ? (

    <a
      href={`https://wa.me/${formatWhatsappPhone(val)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.contactLink}
    >
      {val}
    </a>

  ) : (
    <span className={styles.empty}>—</span>
  ),
},
  {
    key: "email", label: "Email", width: "22%",
    render: (val) => val
      ? <a href={`mailto:${val}`} className={styles.contactLink}>{val}</a>
      : <span className={styles.empty}>—</span>,
  },
  {
    key: "statut", label: "Statut", width: "12%",
    render: (val) => (
      <span className={val === "active" ? styles.badgeActive : styles.badgeInactive}>
        <span className={styles.dot} />
        {val === "active" ? "Actif" : "Inactif"}
      </span>
    ),
  },
    {
      key: "ice", label: "ICE", width: "13%",
      render: (val) =>
        val
          ? <code className={styles.iceCode}>{val}</code>
          : <span className={styles.empty}>—</span>,
    },

  {
    key: "created_at", label: "Créé le", width: "14%",
    render: (val) => val
      ? new Date(val).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
      : <span className={styles.empty}>—</span>,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function ClientsPage() {
  const {
    clients, pagination, total, stats,
    fetchLoading, createLoading, updateLoading, deleteLoading,
    fetchClients, createClient, updateClient, deleteClient,
  } = useClients();

  const [filters,       setFilters]       = useState({ per_page: "10", sort_by: "created_at" });
  const [modal,         setModal]         = useState({ open: false, mode: null, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification,  setNotification]  = useState(null);

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const load = useCallback(
    (page = 1) => fetchClients({ ...filters, page }),
    [filters] // eslint-disable-line
  );
  useEffect(() => { load(1); }, [filters]); // eslint-disable-line

  /* ── Notification ─────────────────────────────────────────────────────── */
  const notify = useCallback((type, message, duration = 3500) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  }, []);

  /* ── Modal ────────────────────────────────────────────────────────────── */
  const openCreate = () => setModal({ open: true, mode: "create", data: null });
  const openEdit   = (row) => setModal({ open: true, mode: "edit",   data: row });
  const openView   = (row) => setModal({ open: true, mode: "view",   data: row });
  const closeModal = () => setModal({ open: false, mode: null, data: null });

  const handleSubmit = async (payload) => {
    try {
      if (modal.mode === "create") {
        await createClient(payload);
        notify("success", "Client créé avec succès.");
      } else {
        await updateClient(modal.data.id, payload);
        notify("success", "Client mis à jour avec succès.");
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
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteClient(deleteConfirm.id);
      setDeleteConfirm(null);
      notify("success", `"${deleteConfirm.nom_complet}" supprimé avec succès.`);
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
    { key: "view",   label: "Voir",      icon: <EyeIcon />,   onClick: openView                       },
    { key: "edit",   label: "Modifier",  icon: <EditIcon />,  onClick: openEdit                       },
    { key: "delete", label: "Supprimer", icon: <TrashIcon />, onClick: (row) => setDeleteConfirm(row) },
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
          <span className={styles.toastDot} />{notification.message}
        </div>
      )}

      <PageHeader
        title="Clients"
        subtitle={`${total} client${total !== 1 ? "s" : ""} enregistré${total !== 1 ? "s" : ""}`}
        actions={
          <button className={styles.createBtn} onClick={openCreate} disabled={createLoading}>
            <PlusIcon />Nouveau client
          </button>
        }
      />

      <ClientStats stats={stats} />

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ per_page: "10", sort_by: "created_at" })}
        filterFields={FILTER_FIELDS}
      />

      <div className={styles.tableSection}>
        <DataTable
          columns={COLUMNS}
          data={clients}
          loading={fetchLoading}
          actions={tableActions}
          pagination={paginationProps}
        />
      </div>

      {modal.open && (
        <ClientModal
          mode={modal.mode}
          initialData={modal.data}
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
              <strong>{deleteConfirm.nom_complet}</strong> ?
              {deleteConfirm.nom_entreprise && (
                <span className={styles.deleteSubInfo}>
                  <br />{deleteConfirm.nom_entreprise}
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