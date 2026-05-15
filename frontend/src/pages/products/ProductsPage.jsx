import { useState, useEffect, useCallback } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useFournisseur } from "../../hooks/useFournisseur";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import FilterPanel from "../../components/common/FilterPanel";
import ProductModal from "./components/ProductModal/ProductModal";
import ProductStats from "./components/ProductStats/ProductStats";
import styles from "./ProductsPage.module.css";

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
const FILTER_FIELDS = [
  { key: "search",         label: "Recherche",    type: "text",   placeholder: "Nom ou description…" },
  { key: "category_id",   label: "Catégorie",    type: "select", options: [] }, // injecté dynamiquement
  {key: "type",          label: "Type",         type: "select",
    options: [
      {  value: "product", label: "Produit" },
      { value: "service", label: "Service" },
    ]
  },
  {},
  { key: "actif",          label: "Statut",       type: "select",
    options: [{ value: "1", label: "Actif" }, { value: "0", label: "Inactif" }] },
  { key: "min_price",      label: "Prix min",     type: "number", placeholder: "0" },
  { key: "max_price",      label: "Prix max",     type: "number", placeholder: "9999" },
  { key: "sort_by",        label: "Trier par",    type: "select",
    options: [
      { value: "created_at",      label: "Date création" },
      { value: "nom",             label: "Nom" },
      { value: "prix_unitaire_ht",label: "Prix" },
      { value: "quantite_stock",  label: "Stock" },
    ],
  },
  { key: "per_page", label: "Par page", type: "select",
    options: [{ value: "10", label: "10" }, { value: "25", label: "25" }, { value: "50", label: "50" }],
  },
];
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";
const COLUMNS = [
  {

    key: "nom", label: "Produit", width: "28%",
    render: (val, row) => (
      <div className={styles.cellName}>
        <div className={styles.avatar}>
          {row.image
            ? <img src={`${STORAGE_URL}/${row.image}`} alt={val} className={styles.avatarImg} />
            : val?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <div className={styles.nameText}>{val}</div>
          {row.category?.name && (
            <div className={styles.nameSubtext}>{row.category.name}</div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "prix_unitaire_ht", label: "Prix HT", width: "12%",
    render: (val) => (
      <span className={styles.priceText}>
        {val != null          ? Number(val).toLocaleString("fr-FR", { style: "currency", currency: "MAD" })
          : <span className={styles.empty}>—</span>}
      </span>
    ),
  },
  {
    key: "quantite_stock", label: "Stock", width: "12%",
    render: (val) => {
      const n = val ?? 0;
      const cls = n < 10 ? styles.stockLow : n < 50 ? styles.stockMid : styles.stockOk;
      return <span className={`${styles.stockBadge} ${cls}`}>{n}</span>;
    },
  },
  {
    key: "fournisseur", label: "Fournisseur", width: "16%",
    render: (val) => val?.nom
      ? <span className={styles.fournisseurText}>{val.nom}</span>
      : <span className={styles.empty}>—</span>,
  },
  {
    key: "actif", label: "Statut", width: "12%",
    render: (val) => (
      <span className={val ? styles.badgeActive : styles.badgeInactive}>
        <span className={styles.dot} />
        {val ? "Actif" : "Inactif"}
      </span>
    ),
  },
  {
    key: "created_at", label: "Créé le", width: "14%",
    render: (val) => val
      ? new Date(val).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
      : <span className={styles.empty}>—</span>,
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function ProductsPage() {
  const {
    products, pagination, total, stats,error,
    fetchLoading, createLoading, updateLoading, deleteLoading,
    fetchProducts, createProduct, updateProduct, deleteProduct,
  } = useProducts();

  const { activeList, fetchActiveCategories } = useCategories();
  const { activeList: activeListfournisseur, fetchActiveFournisseurs } = useFournisseur();

  const [filters,       setFilters]       = useState({ per_page: "10", sort_by: "created_at" });
  const [modal,         setModal]         = useState({ open: false, mode: null, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification,  setNotification]  = useState(null);

  /* ── Charger les catégories pour le filtre ────────────────────────────── */
  useEffect(() => {
     fetchActiveCategories(); 
      fetchActiveFournisseurs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Injecter les catégories dans FILTER_FIELDS dynamiquement ─────────── */
  const filterFields = FILTER_FIELDS.map((f) =>
    f.key === "category_id"
      ? { ...f, options: activeList.map((c) => ({ value: String(c.id), label: c.name })) }
      : f
  );
  console.log("Active products:", products)  ;
  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const load = useCallback(
    (page = 1) => fetchProducts({ ...filters, page }),
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
  const openEdit   = (row) => setModal({ open: true, mode: "edit",   data: row }); 
  const openView   = (row) => setModal({ open: true, mode: "view",   data: row });
  const closeModal = () => setModal({ open: false, mode: null, data: null });

  const handleSubmit = async (formData) => {
    try {
      if (modal.mode === "create") {
        await createProduct(formData);
        notify("success", "Produit créé avec succès.");
      } else {
        await updateProduct(modal.data.id, formData);
        notify("success", "Produit mis à jour avec succès.");
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
  if (error) {
    console.log("Error selecting product:", error);
  }
  const handleDeleteRequest = (row) => setDeleteConfirm(row);
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const nom = deleteConfirm.nom;
    try {
      await deleteProduct(deleteConfirm.id);
      setDeleteConfirm(null);
      notify("success", `"${nom}" supprimé avec succès.`);
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

  const tableActions = [
    { key: "view",   label: "Voir",      icon: <EyeIcon />,   onClick: openView            },
    { key: "edit",   label: "Modifier",  icon: <EditIcon />,  onClick: openEdit            },
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

      {notification && (
        <div className={`${styles.toast} ${styles[`toast--${notification.type}`]}`}>
          <span className={styles.toastDot} />
          {notification.message}
        </div>
      )}

      <PageHeader
        title="Produits"
        subtitle={`${total} produit${total !== 1 ? "s" : ""} enregistré${total !== 1 ? "s" : ""}`}
        actions={
          <button className={styles.createBtn} onClick={openCreate} disabled={createLoading}>
            <PlusIcon />
            Nouveau produit
          </button>
        }
      />

      {/* Stats — viennent du controller via state.stats */}
      <ProductStats stats={stats} />

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ per_page: "10", sort_by: "created_at" })}
        filterFields={filterFields}
      />

      <div className={styles.tableSection}>
        <DataTable
          columns={COLUMNS}
          data={products}
          loading={fetchLoading}
          actions={tableActions}
          pagination={paginationProps}
        />
      </div>

      {modal.open && (
        <ProductModal
          mode={modal.mode}
          initialData={modal.data}
          categories={activeList}
          fournisseurs={activeListfournisseur}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={modal.mode === "create" ? createLoading : updateLoading}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className={styles.backdropDelete}>
          <div className={styles.deleteCard}>
            <div className={styles.deleteIcon}><TrashIcon /></div>
            <h3 className={styles.deleteTitle}>Confirmer la suppression</h3>
            <p className={styles.deleteMsg}>
              Voulez-vous vraiment supprimer{" "}
              <strong>{deleteConfirm.nom}</strong> ?
              {deleteConfirm.quantite_stock > 0 && (
                <span className={styles.deleteWarning}>
                  <br />⚠ Ce produit a encore{" "}
                  <strong>{deleteConfirm.quantite_stock} unité{deleteConfirm.quantite_stock > 1 ? "s" : ""}</strong>{" "}
                  en stock.
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