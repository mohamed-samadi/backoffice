import { useState, useEffect, useCallback } from "react";
import { useCheques } from "../../hooks/useCheques";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import FilterPanel from "../../components/common/FilterPanel";
import ChequeModal from "./components/ChequeModal/ChequeModal";
import ChequeStats from "./components/ChequeStats/ChequeStats";
import styles from "./ChequesPage.module.css";
import {useClients }from '../../hooks/useClients'
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
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

/* ── Constantes ──────────────────────────────────────────────────────────── */
const STATUT_META = {
  non_encaisse: { label: "Non encaissé", color: "purple" },
  encaisse:     { label: "Encaissé",     color: "green"  },
  impaye:       { label: "Impayé",       color: "red"    },
  annule:       { label: "Annulé",       color: "amber"  },
};
const FILTER_FIELDS_BASE  = [
  { key: "search",    label: "Recherche",  type: "text",   placeholder: "N° chèque, banque, titulaire…" },
  { key: "statut",    label: "Statut",     type: "select",
    options: [
      { value: "non_encaisse", label: "Non encaissé" },
      { value: "encaisse",     label: "Encaissé"     },
      { value: "impaye",       label: "Impayé"       },
      { value: "annule",       label: "Annulé"       },
    ],
  },
  { key: "banque",    label: "Banque",     type: "text",   placeholder: "CIH, Attijariwafa…" },
  { key: "sort_by",   label: "Trier par",  type: "select",
    options: [{ value: "created_at", label: "Date création" }, { value: "date_echeance", label: "Échéance" }, { value: "montant", label: "Montant" }],
  },
  { key: "per_page",  label: "Par page",   type: "select",
    options: [{ value: "10", label: "10" }, { value: "25", label: "25" }, { value: "50", label: "50" }],
  },
];

const COLUMNS = [
  {
    key: "numero_cheque", label: "Chèque", width: "22%",
    render: (val, row) => (
      <div className={styles.cellCheque}>
        <div className={`${styles.statutBar} ${styles[`bar--${STATUT_META[row.statut]?.color}`]}`} />
        <div>
          <code className={styles.chequeNum}>{val}</code>
          <div className={styles.chequeSub}>{row.banque}</div>
        </div>
      </div>
    ),
  },
  {
    key: "titulaire", label: "Titulaire", width: "18%",
    render: (val) => <span className={styles.titulaireText}>{val}</span>,
  },
  {
    key: "montant", label: "Montant", width: "14%",
    render: (val) => (
      <span className={styles.montantText}>
        {val != null
          ? Number(val).toLocaleString("fr-FR", { style: "currency", currency: "MAD" })
          : <span className={styles.empty}>—</span>}
      </span>
    ),
  },
  {
    key: "statut", label: "Statut", width: "14%",
    render: (val) => {
      const meta = STATUT_META[val] || { label: val, color: "accent" };
      return (
        <span className={`${styles.statutBadge} ${styles[`statut--${meta.color}`]}`}>
          <span className={styles.dot} />{meta.label}
        </span>
      );
    },
  },
  {
    key: "date_echeance", label: "Échéance", width: "14%",
    render: (val, row) => {
      if (!val) return <span className={styles.empty}>—</span>;
      const isOverdue = new Date(val) < new Date() && row.statut === "non_encaisse";
      return (
        <span className={isOverdue ? styles.dateOverdue : styles.dateNormal}>
          {new Date(val).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      );
    },
  },
  {
    key: "client", label: "Client", width: "16%",
    render: (val) => val?.nom_complet
      ? <span className={styles.clientText}>{val.nom_complet}</span>
      : <span className={styles.empty}>—</span>,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function ChequesPage() {
   const { activeClients, fetchActiveClients } = useClients();
  const {
    cheques, pagination, total, stats,
    fetchLoading, createLoading, updateLoading, deleteLoading,
    encaisserLoading, marquerImpayeLoading, annulerLoading,
    fetchCheques, createCheque, updateCheque, deleteCheque,
    encaisserCheque, marquerImpayeCheque, annulerCheque,
  } = useCheques();
  const filterFields = [
    ...FILTER_FIELDS_BASE,
    {
      key: "client_id",
      label: "Client",
      type: "select",
      options: activeClients.map((c) => ({ value: String(c.id), label: c.nom_complet })),
    },
  ];
  const [filters,       setFilters]       = useState({ per_page: "10", sort_by: "created_at" });
  const [modal,         setModal]         = useState({ open: false, mode: null, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionConfirm, setActionConfirm] = useState(null); // { type, cheque }
  const [notification,  setNotification]  = useState(null);

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const load = useCallback(
    (page = 1) => fetchCheques({ ...filters, page }),
    [filters] // eslint-disable-line
  );
  useEffect(() => { load(1); }, [filters]); // eslint-disable-line
  useEffect(() => { fetchActiveClients(); }, []); // eslint-disable-line
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

  const handleSubmit = async (formData) => {
    try {
      if (modal.mode === "create") {
        await createCheque(formData);
        notify("success", "Chèque créé avec succès.");
      } else {
        await updateCheque(modal.data.id, formData);
        notify("success", "Chèque mis à jour avec succès.");
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

  /* ── Actions métier ───────────────────────────────────────────────────── */
  const handleAction = async () => {
    if (!actionConfirm) return;
    const { type, cheque } = actionConfirm;
    try {
      if (type === "encaisser") {
        await encaisserCheque(cheque.id);
        notify("success", `Chèque ${cheque.numero_cheque} encaissé.`);
      } else if (type === "impaye") {
        await marquerImpayeCheque(cheque.id);
        notify("success", `Chèque ${cheque.numero_cheque} marqué impayé.`);
      } else if (type === "annuler") {
        await annulerCheque(cheque.id);
        notify("success", `Chèque ${cheque.numero_cheque} annulé.`);
      }
      setActionConfirm(null);
      await load(pagination.currentPage);
    } catch (err) {
      setActionConfirm(null);
      notify("error", err?.message || "Erreur lors de l'action.", 5000);
    }
  };

  /* ── Delete ───────────────────────────────────────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCheque(deleteConfirm.id);
      setDeleteConfirm(null);
      notify("success", `Chèque ${deleteConfirm.numero_cheque} supprimé.`);
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

  /* ── Table actions ────────────────────────────────────────────────────── */
  const tableActions = [
    { key: "view",    label: "Voir",      icon: <EyeIcon />,   onClick: openView },
    { key: "edit",    label: "Modifier",  icon: <EditIcon />,  onClick: openEdit },
    {
      key: "encaisser", label: "Encaisser", icon: <CheckIcon />,
      onClick: (row) => {
        if (row.statut === "non_encaisse") setActionConfirm({ type: "encaisser", cheque: row });
        else notify("error", "Ce chèque ne peut pas être encaissé.", 3000);
      },
    },
    {
      key: "impaye", label: "Impayé", icon: <AlertIcon />,
      onClick: (row) => {
        if (["non_encaisse", "encaisse"].includes(row.statut)) setActionConfirm({ type: "impaye", cheque: row });
        else notify("error", "Ce chèque ne peut pas être marqué impayé.", 3000);
      },
    },
    {
      key: "annuler", label: "Annuler", icon: <XIcon />,
      onClick: (row) => {
        if (row.statut !== "encaisse") setActionConfirm({ type: "annuler", cheque: row });
        else notify("error", "Impossible d'annuler un chèque déjà encaissé.", 3000);
      },
    },
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

  const actionMeta = {
    encaisser: { label: "Encaisser",      btnClass: styles.actionBtnGreen,  msg: "Confirmer l'encaissement de ce chèque ?" },
    impaye:    { label: "Marquer impayé", btnClass: styles.actionBtnRed,    msg: "Marquer ce chèque comme impayé ?" },
    annuler:   { label: "Annuler",        btnClass: styles.actionBtnAmber,  msg: "Confirmer l'annulation de ce chèque ?" },
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
        title="Chèques"
        subtitle={`${total} chèque${total !== 1 ? "s" : ""} enregistré${total !== 1 ? "s" : ""}`}
        actions={
          <button className={styles.createBtn} onClick={openCreate} disabled={createLoading}>
            <PlusIcon />Nouveau chèque
          </button>
        }
      />

      <ChequeStats stats={stats} />

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ per_page: "10", sort_by: "created_at" })}
        filterFields={filterFields}
      />

      <div className={styles.tableSection}>
        <DataTable
          columns={COLUMNS}
          data={cheques}
          loading={fetchLoading}
          actions={tableActions}
          pagination={paginationProps}
        />
      </div>

      {modal.open && (
        <ChequeModal
          mode={modal.mode}
          initialData={modal.data}
          clients={activeClients}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={modal.mode === "create" ? createLoading : updateLoading}
        />
      )}

      {/* ── Confirmation action métier ───────────────────────────────────── */}
      {actionConfirm && (
        <div className={styles.backdropDelete}>
          <div className={styles.deleteCard}>
            <div className={`${styles.deleteIcon} ${styles[`deleteIcon--${actionConfirm.type}`]}`}>
              {actionConfirm.type === "encaisser" ? <CheckIcon /> : actionConfirm.type === "impaye" ? <AlertIcon /> : <XIcon />}
            </div>
            <h3 className={styles.deleteTitle}>Confirmer l'action</h3>
            <p className={styles.deleteMsg}>
              {actionMeta[actionConfirm.type]?.msg}
              <br />
              <strong>{actionConfirm.cheque.numero_cheque}</strong>
              {" — "}
              {Number(actionConfirm.cheque.montant).toLocaleString("fr-FR", { style: "currency", currency: "MAD" })}
            </p>
            <div className={styles.deleteActions}>
              <button className={styles.cancelBtn} onClick={() => setActionConfirm(null)}
                disabled={encaisserLoading || marquerImpayeLoading || annulerLoading}>
                Annuler
              </button>
              <button
                className={`${styles.deleteBtn} ${actionMeta[actionConfirm.type]?.btnClass}`}
                onClick={handleAction}
                disabled={encaisserLoading || marquerImpayeLoading || annulerLoading}
              >
                {encaisserLoading || marquerImpayeLoading || annulerLoading
                  ? "Traitement…"
                  : actionMeta[actionConfirm.type]?.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation suppression ─────────────────────────────────────── */}
      {deleteConfirm && (
        <div className={styles.backdropDelete}>
          <div className={styles.deleteCard}>
            <div className={styles.deleteIcon}><TrashIcon /></div>
            <h3 className={styles.deleteTitle}>Confirmer la suppression</h3>
            <p className={styles.deleteMsg}>
              Voulez-vous vraiment supprimer le chèque{" "}
              <strong>{deleteConfirm.numero_cheque}</strong> ?
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