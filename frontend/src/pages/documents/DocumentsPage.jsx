import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import FilterPanel from "../../components/common/FilterPanel";
import { useDocuments } from "../../hooks/useDocuments";
import styles from "./DocumentsPage.module.css";

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const EyeIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);

const FILTER_FIELDS = [
    { key: "search", label: "Recherche", type: "text", placeholder: "Numéro, client, statut…" },
    {
        key: "type",
        label: "Type",
        type: "select",
        options: [
            { value: "facture", label: "Facture" },
            { value: "devis", label: "Devis" },
            { value: "bon_livraison", label: "Bon de livraison" },
        ],
    },
    { key: "statut", label: "Statut", type: "text", placeholder: "Ex : brouillon" },
    { key: "statut_paiement", label: "Paiement", type: "text", placeholder: "Ex : payé" },
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

const currency = (value) =>
    Number(value || 0).toLocaleString("fr-FR", {
        style: "currency",
        currency: "MAD",
    });

const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getClientLabel = (client) =>
    client?.nom_entreprise || client?.nom_complet || client?.email || "—";

const getClientName = (client) => client?.nom_complet || client?.nom_entreprise || "—";

const getClientEntreprise = (client) => client?.nom_entreprise || "—";

const COLUMNS = [
    {
        key: "numero",
        label: "Num",
        width: "10%",
        render: (val) => <span className={styles.nameText}>{val}</span>,
    },
    {
        key: "type",
        label: "Type",
        width: "10%",
        render: (val) => <span className={styles.clientText}>{val || "—"}</span>,
    },
    {
        key: "client",
        label: "Client",
        width: "18%",
        render: (val) => (
            <div>
                <div className={styles.nameText}>{getClientName(val)}</div>
                <div className={styles.nameSubtext}>{getClientEntreprise(val)}</div>
            </div>
        ),
    },
    {
        key: "date_creation",
        label: "Date",
        width: "10%",
        render: (val) => <span className={styles.dateText}>{formatDate(val)}</span>,
    },
    {
        key: "date_validite",
        label: "Echeance",
        width: "10%",
        render: (val) => <span className={styles.dateText}>{formatDate(val)}</span>,
    },
    {
        key: "total_ht",
        label: "HT",
        width: "10%",
        render: (val) => <span className={styles.amount}>{currency(val)}</span>,
    },
    {
        key: "total_tva",
        label: "TVA",
        width: "10%",
        render: (val) => <span className={styles.amount}>{currency(val)}</span>,
    },
    {
        key: "total_ttc",
        label: "TTC",
        width: "10%",
        render: (val) => <span className={styles.amount}>{currency(val)}</span>,
    },
    {
        key: "statut",
        label: "Status",
        width: "12%",
        render: (val) => (
            <span className={styles.badgeNeutral}>{val || "—"}</span>
        ),
    },
];

export default function DocumentsPage() {
    const navigate = useNavigate();
    const {
        documents,
        stats,
        fetchLoading,
        deleteLoading,
        fetchDocuments,
        fetchStats,
        deleteDocument,
        currentPage,
        lastPage,
        totalDocuments,
        perPage,
    } = useDocuments();

    const [filters, setFilters] = useState({ per_page: "10" });
    const [currentPageLocal, setCurrentPageLocal] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [notification, setNotification] = useState(null);

    // When search, type, or per_page changes, reset to page 1
    useEffect(() => {
        setCurrentPageLocal(1);
    }, [filters.search, filters.type, filters.per_page]);

    // Fetch documents when filters or current page changes
    useEffect(() => {
        const params = { page: currentPageLocal };
        if (filters.search) params.search = filters.search;
        if (filters.type) params.type = filters.type;
        if (filters.per_page) params.per_page = Number(filters.per_page);
        
        fetchDocuments(params);
    }, [filters, currentPageLocal, fetchDocuments]);

    // Fetch stats when search or type changes (not paginated)
    useEffect(() => {
        const statsParams = {};
        if (filters.search) statsParams.search = filters.search;
        if (filters.type) statsParams.type = filters.type;
        
        fetchStats(statsParams);
    }, [filters.search, filters.type, fetchStats]);

    const notify = (type, message, duration = 3500) => {
        setNotification({ type, message });
        window.setTimeout(() => setNotification(null), duration);
    };

    const tableActions = [
        {
            key: "view",
            label: "Voir",
            icon: <EyeIcon />,
            onClick: (row) => navigate(`/documents/${row.id}`),
        },
        {
            key: "delete",
            label: "Supprimer",
            icon: <TrashIcon />,
            onClick: (row) => setDeleteConfirm(row),
        },
    ];

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;

        try {
            await deleteDocument(deleteConfirm.id);
            setDeleteConfirm(null);
            notify("success", `Document ${deleteConfirm.numero} supprimé avec succès.`);
        } catch (error) {
            setDeleteConfirm(null);
            const message = error?.message || "Erreur lors de la suppression.";
            notify("error", message, 5000);
        }
    };

    return (
        <div className={styles.page}>
            {notification && (
                <div className={`${styles.toast} ${styles[`toast--${notification.type}`]}`}>
                    <span className={styles.toastDot} />
                    {notification.message}
                </div>
            )}

            <PageHeader
                title="Documents"
                subtitle={`Page ${currentPage} sur ${lastPage} (${totalDocuments} total${totalDocuments !== 1 ? "s" : ""})`}
                actions={
                    <button className={styles.createBtn} type="button" disabled>
                        <PlusIcon />
                        Nouveau document
                    </button>
                }
            />

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total</span>
                    <strong className={styles.statValue}>{stats.total}</strong>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Factures</span>
                    <strong className={styles.statValue}>{stats.factures}</strong>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Devis</span>
                    <strong className={styles.statValue}>{stats.devis}</strong>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Reste à payer</span>
                    <strong className={styles.statValue}>{currency(stats.reste_a_payer)}</strong>
                </div>
            </div>

            <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                onReset={() => setFilters({ per_page: "10" })}
                filterFields={FILTER_FIELDS}
            />

            <div >
                <section className={styles.tableSection}>
                    <DataTable
                        columns={COLUMNS}
                        data={documents}
                        loading={fetchLoading}
                        actions={tableActions}
                    />
                </section>
                
                {/* Pagination Controls */}
                {lastPage > 1 && (
                    <div className={styles.paginationControls}>
                        <button
                            type="button"
                            className={styles.paginationBtn}
                            disabled={currentPage === 1 || fetchLoading}
                            onClick={() => setCurrentPageLocal(currentPage - 1)}
                        >
                            ← Précédent
                        </button>
                        <span className={styles.paginationInfo}>
                            Page {currentPage} / {lastPage}
                        </span>
                        <button
                            type="button"
                            className={styles.paginationBtn}
                            disabled={currentPage === lastPage || fetchLoading}
                            onClick={() => setCurrentPageLocal(currentPage + 1)}
                        >
                            Suivant →
                        </button>
                    </div>
                )}
            </div>

            {deleteConfirm && (
                <div className={styles.confirmOverlay}>
                    <div className={styles.confirmCard}>
                        <h3>Supprimer ce document ?</h3>
                        <p>
                            {deleteConfirm.numero} sera supprimé définitivement.
                        </p>
                        <div className={styles.confirmActions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleteLoading}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className={styles.dangerBtn}
                                onClick={handleDeleteConfirm}
                                disabled={deleteLoading}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

