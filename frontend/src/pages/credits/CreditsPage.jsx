import { useState, useEffect, useCallback } from "react";
import { useCredits } from "../../hooks/useCredits";
import { useClients } from "../../hooks/useClients";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import FilterPanel from "../../components/common/FilterPanel";
import CreditModal from "./components/CreditModal";
import CreditStats from "./components/CreditStats";
import styles from "./CreditsPage.module.css";

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const STATUT_META = {
  en_attente: { label: "En attente", color: "purple" },
  actif: { label: "Actif", color: "accent" },
  en_retard: { label: "En retard", color: "amber" },
  impaye: { label: "Impayé", color: "red" },
  solde: { label: "Soldé", color: "green" },
  annule: { label: "Annulé", color: "red" },
};

const FILTER_FIELDS_BASE = [
  {
    key: "search",
    label: "Recherche",
    type: "text",
    placeholder: "N° crédit, client…",
  },
  {
    key: "statut",
    label: "Statut",
    type: "select",
    options: Object.entries(STATUT_META).map(([value, meta]) => ({
      value,
      label: meta.label,
    })),
  },
  {
    key: "sort_by",
    label: "Trier par",
    type: "select",
    options: [
      { value: "created_at", label: "Date création" },
      { value: "date_echeance", label: "Échéance" },
      { value: "montant_total", label: "Montant" },
    ],
  },
  {
    key: "per_page",
    label: "Par page",
    type: "select",
    options: [
      { value: "10", label: "10" },
      { value: "25", label: "25" },
      { value: "50", label: "50" },
    ],
  },
];

const fmt = (val) =>
  Number(val || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "MAD",
  });

const COLUMNS = [
  {
    key: "numero_credit",
    label: "N° Crédit",
    width: "16%",
    render: (val, row) => (
      <div className={styles.cellCredit}>
        <div
          className={`${styles.statutBar} ${
            styles[`bar--${STATUT_META[row.statut]?.color}`]
          }`}
        />
        <code className={styles.creditNum}>{val}</code>
      </div>
    ),
  },
  {
    key: "client",
    label: "Client",
    width: "20%",
    render: (val) =>
      val?.nom_complet ? (
        <span className={styles.clientText}>{val.nom_complet}</span>
      ) : (
        <span className={styles.empty}>—</span>
      ),
  },
  {
    key: "montant_total",
    label: "Total",
    width: "13%",
    render: (val) => (
      <span className={styles.montantText}>{fmt(val)}</span>
    ),
  },
  {
    key: "reste",
    label: "Reste",
    width: "13%",
    render: (val) => (
      <span className={Number(val) > 0 ? styles.resteRed : styles.resteGreen}>
        {fmt(val)}
      </span>
    ),
  },
  {
    key: "statut",
    label: "Statut",
    width: "14%",
    render: (val) => {
      const meta = STATUT_META[val] || {
        label: val,
        color: "accent",
      };

      return (
        <span
          className={`${styles.statutBadge} ${
            styles[`statut--${meta.color}`]
          }`}
        >
          <span className={styles.dot} />
          {meta.label}
        </span>
      );
    },
  },
  {
    key: "date_echeance",
    label: "Échéance",
    width: "14%",
    render: (val, row) => {
      if (!val) {
        return <span className={styles.empty}>—</span>;
      }

      const overdue =
        new Date(val) < new Date() && row.statut !== "solde";

      return (
        <span className={overdue ? styles.dateOverdue : styles.dateNormal}>
          {new Date(val).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      );
    },
  },
];

/* ════════════════════════════════════════════════════════════════════════ */

export default function CreditsPage() {
  const {
    credits,
    pagination,
    total,
    stats,
    numeroPreview,
    fetchLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    paiementLoading,
    fetchCredits,
    fetchCreditById,
    createCredit,
    updateCredit,
    deleteCredit,
    enregistrerPaiement,
    generateNumeroCredit,
  } = useCredits();

  const { activeClients, fetchActiveClients } = useClients();

  useEffect(() => {
    fetchActiveClients();
  }, []);

  const [filters, setFilters] = useState({
    per_page: "10",
    sort_by: "created_at",
  });

  const [modal, setModal] = useState({
    open: false,
    mode: null,
    data: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);

  const filterFields = [
    ...FILTER_FIELDS_BASE,
    {
      key: "client_id",
      label: "Client",
      type: "select",
      options: activeClients.map((c) => ({
        value: String(c.id),
        label: c.nom_complet,
      })),
    },
  ];

  /* ── Fetch ─────────────────────────────────────────────────────────── */

  const load = useCallback(
    (page = 1) => fetchCredits({ ...filters, page }),
    [filters] // eslint-disable-line
  );

  useEffect(() => {
    load(1);
  }, [filters]); // eslint-disable-line

  /* ── Générer numéro à l'ouverture du modal create ─────────────────── */

  useEffect(() => {
    if (modal.open && modal.mode === "create") {
      generateNumeroCredit().catch(() => {});
    }
  }, [modal.open, modal.mode]); // eslint-disable-line

  /* ── Notification ──────────────────────────────────────────────────── */

  const notify = useCallback((type, message, duration = 3500) => {
    setNotification({ type, message });

    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  /* ── Modal ─────────────────────────────────────────────────────────── */

  const openCreate = () =>
    setModal({
      open: true,
      mode: "create",
      data: null,
    });

  const openEdit = (row) =>
    setModal({
      open: true,
      mode: "edit",
      data: row,
    });

  const openView = (row) =>
    setModal({
      open: true,
      mode: "view",
      data: row,
    });

  const closeModal = () =>
    setModal({
      open: false,
      mode: null,
      data: null,
    });

  const handleSubmit = async (payload) => {
    try {
      if (modal.mode === "create") {
        await createCredit(payload);
        notify("success", "Crédit créé avec succès.");
      } else {
        await updateCredit(modal.data.id, payload);
        notify("success", "Crédit mis à jour avec succès.");
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

  /* ── Paiement partiel ──────────────────────────────────────────────── */

  const handlePaiement = async (montant) => {
    if (!modal.data) return;

    try {
      await enregistrerPaiement(modal.data.id, montant);

      notify("success", "Paiement enregistré avec succès.");

      // Rafraîchir le crédit affiché dans le modal
      const updatedCredit = await fetchCreditById(modal.data.id);

      setModal((prev) => ({
        ...prev,
        data: updatedCredit,
      }));

      // Rafraîchir la liste
      await load(pagination.currentPage);
    } catch (err) {
      notify(
        "error",
        err?.message || "Erreur lors du paiement.",
        5000
      );
    }
  };

  /* ── Delete ────────────────────────────────────────────────────────── */

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteCredit(deleteConfirm.id);

      setDeleteConfirm(null);

      notify(
        "success",
        `Crédit ${deleteConfirm.numero_credit} supprimé.`
      );

      const newTotal = total - 1;
      const perPage = Number(filters.per_page) || 10;

      const maxPage = Math.max(
        1,
        Math.ceil(newTotal / perPage)
      );

      const targetPage = Math.min(
        pagination.currentPage,
        maxPage
      );

      await load(targetPage);
    } catch (err) {
      setDeleteConfirm(null);

      notify(
        "error",
        err?.message || "Erreur lors de la suppression.",
        5000
      );
    }
  };

  /* ── Table ─────────────────────────────────────────────────────────── */

  const tableActions = [
    {
      key: "view",
      label: "Voir",
      icon: <EyeIcon />,
      onClick: openView,
    },
    {
      key: "edit",
      label: "Modifier",
      icon: <EditIcon />,
      onClick: openEdit,
    },
    {
      key: "delete",
      label: "Supprimer",
      icon: <TrashIcon />,
      onClick: setDeleteConfirm,
    },
  ];

  const paginationProps = {
    currentPage: pagination.currentPage,
    totalPages: pagination.lastPage,
    hasPrev: pagination.currentPage > 1,
    hasNext: pagination.currentPage < pagination.lastPage,
    onPrev: () => load(pagination.currentPage - 1),
    onNext: () => load(pagination.currentPage + 1),
  };

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <div className={styles.page}>
      {notification && (
        <div
          className={`${styles.toast} ${
            styles[`toast--${notification.type}`]
          }`}
        >
          <span className={styles.toastDot} />
          {notification.message}
        </div>
      )}

      <PageHeader
        title="Crédits"
        subtitle={`${total} crédit${
          total !== 1 ? "s" : ""
        } enregistré${total !== 1 ? "s" : ""}`}
        actions={
          <button
            className={styles.createBtn}
            onClick={openCreate}
            disabled={createLoading}
          >
            <PlusIcon />
            Nouveau crédit
          </button>
        }
      />

      <CreditStats stats={stats} />

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() =>
          setFilters({
            per_page: "10",
            sort_by: "created_at",
          })
        }
        filterFields={filterFields}
      />

      <div className={styles.tableSection}>
        <DataTable
          columns={COLUMNS}
          data={credits}
          loading={fetchLoading}
          actions={tableActions}
          pagination={paginationProps}
        />
      </div>

      {modal.open && (
        <CreditModal
          mode={modal.mode}
          initialData={modal.data}
          clients={activeClients}
          numeroPreview={numeroPreview}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onPaiement={handlePaiement}
          loading={
            modal.mode === "create"
              ? createLoading
              : updateLoading
          }
          paiementLoading={paiementLoading}
        />
      )}

      {/* Confirmation suppression */}
      {deleteConfirm && (
        <div className={styles.backdropDelete}>
          <div className={styles.deleteCard}>
            <div className={styles.deleteIcon}>
              <TrashIcon />
            </div>

            <h3 className={styles.deleteTitle}>
              Confirmer la suppression
            </h3>

            <p className={styles.deleteMsg}>
              Voulez-vous vraiment supprimer le crédit{" "}
              <strong>{deleteConfirm.numero_credit}</strong> ?

              {Number(deleteConfirm.reste) > 0 && (
                <span className={styles.deleteWarning}>
                  <br />
                  ⚠ Ce crédit a encore{" "}
                  <strong>{fmt(deleteConfirm.reste)}</strong>{" "}
                  de reste dû.
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
                {deleteLoading
                  ? "Suppression…"
                  : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}