import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./ProductModal.module.css";
import ImageViewer from "../../../../components/common/imageviewer/ImageViewer";
/* ── Icons ───────────────────────────────────────────────────────────────── */
const ExpandIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SaveIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const UploadIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
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

/* ── Constantes ──────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  nom: "",
  type: "",
  sku: "",
  code_barre: "",
  description: "",
  prix_unitaire_ht: "",
  tva: "20",
  prix_revient: "",
  quantite_stock: "",
  seuil_alerte_stock: "10",
  category_id: "",
  fournisseur_id: "",
  actif: true,
};

const TYPE_OPTIONS = [
  { value: "product", label: "Produit" },
  { value: "service", label: "Service" },
];

const STORAGE_URL =
  import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function ProductModal({
  mode = "create",
  initialData = null,
  categories = [],
  fournisseurs = [],
  onClose,
  onSubmit,
  loading = false,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const title =
    mode === "create"
      ? "Nouveau produit"
      : mode === "edit"
        ? "Modifier le produit"
        : "Détails du produit";

  const fileInputRef = useRef(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // INIT — déclenché uniquement sur changement de initialData
  // ✅ Séparé du useEffect SKU pour éviter la boucle infinie
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        category_id: initialData.category?.id ?? initialData.category_id ?? "",
        fournisseur_id:
          initialData.fournisseur?.id ?? initialData.fournisseur_id ?? "",
        // ✅ Les champs decimal viennent comme string "300.00" — on les garde tels quels
        // Number() dans les inputs les affiche correctement
      });
      if (initialData.image) {
        setImagePreview(`${STORAGE_URL}/${initialData.image}`);
      } else {
        setImagePreview(null);
      }
    } else {
      setForm(EMPTY_FORM);
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
  }, [initialData]);

  // ─────────────────────────────────────────────────────────────────────────
  // AUTO-GÉNÉRATION SKU — déclenché uniquement quand type change
  // ✅ Ne tourne pas en mode edit (SKU déjà défini)
  // ✅ Séparé du useEffect init pour éviter la boucle infinie
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!form.type || isEdit) return;

    fetch(`/api/products/generate-sku?type=${form.type}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sku) {
          setForm((prev) => ({ ...prev, sku: data.sku }));
        }
      })
      .catch(() => {}); // silencieux si le endpoint n'existe pas encore
  }, [form.type]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Escape key ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ─── Cleanup blob URL ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
    },
    [errors],
  );

  const handleImageFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Fichier image requis (jpg, png, webp…)",
        }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image trop lourde (max 2 Mo)",
        }));
        return;
      }
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: null }));
    },
    [imagePreview],
  );

  const handleFileInput = (e) => handleImageFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.nom?.trim()) errs.nom = "Le nom est obligatoire";
    if (form.nom?.trim().length > 255) errs.nom = "Max 255 caractères";
    if (!form.type) errs.type = "Le type est obligatoire";
    if (form.prix_unitaire_ht === "" || form.prix_unitaire_ht === null)
      errs.prix_unitaire_ht = "Le prix est obligatoire";
    if (Number(form.prix_unitaire_ht) < 0)
      errs.prix_unitaire_ht = "Prix invalide";
    if (form.tva === "" || form.tva === null)
      errs.tva = "La TVA est obligatoire";
    if (Number(form.tva) < 0 || Number(form.tva) > 100)
      errs.tva = "TVA entre 0 et 100%";
    if (form.prix_revient === "" || form.prix_revient === null)
      errs.prix_revient = "Le prix de revient est obligatoire";
    if (Number(form.prix_revient) < 0)
      errs.prix_revient = "Prix de revient invalide";
    if (form.quantite_stock === "" || form.quantite_stock === null)
      errs.quantite_stock = "Le stock est obligatoire";
    if (
      Number(form.prix_revient) > 0 &&
      Number(form.prix_unitaire_ht) > Number(form.prix_revient)
    )
      errs.prix_revient =
        "Le prix de revient doit être supérieur ou égal au prix ht";
    if (Number(form.quantite_stock) < 0) errs.quantite_stock = "Stock invalide";
    if (!form.category_id) errs.category_id = "La catégorie est obligatoire";
    return errs;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMIT — construit le FormData
  // ✅ POST + _method=PUT pour les updates (Laravel ne lit pas $_FILES sur PUT)
  // ─────────────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const fd = new FormData();

    // ✅ Method spoofing : POST avec _method=PUT pour que Laravel route vers update()
    // et lise correctement $_FILES — PUT natif ne supporte pas les fichiers
    fd.append("_method", isEdit ? "PUT" : "POST");
    fd.append("nom", form.nom.trim());
    fd.append("type", form.type || "");
    fd.append("sku", form.sku || "");
    fd.append("code_barre", form.code_barre || "");
    fd.append("description", form.description || "");
    fd.append("prix_unitaire_ht", form.prix_unitaire_ht);
    fd.append("tva", form.tva || "0");
    fd.append("prix_revient", form.prix_revient || "0");
    fd.append("quantite_stock", form.quantite_stock);
    fd.append("seuil_alerte_stock", form.seuil_alerte_stock || "10");
    fd.append("category_id", form.category_id);
    fd.append("actif", form.actif ? "1" : "0");
    if (form.fournisseur_id) fd.append("fournisseur_id", form.fournisseur_id);
    if (imageFile) fd.append("image", imageFile);

    onSubmit(fd);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPER
  // ─────────────────────────────────────────────────────────────────────────
  const ViewValue = ({ children }) => (
    <div className={styles.viewValue}>
      {children ?? <span className={styles.viewEmpty}>—</span>}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div
              className={`${styles.modeBadge} ${styles[`modeBadge--${mode}`]}`}
            >
              {mode === "create"
                ? "NOUVEAU"
                : mode === "edit"
                  ? "MODIFIER"
                  : "VUE"}
            </div>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fermer"
          >
            <XIcon />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className={styles.body}>
          {/* Toggle actif */}
          {!isView && (
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Statut du produit</span>
              <button
                type="button"
                className={`${styles.toggle} ${form.actif ? styles.toggleOn : styles.toggleOff}`}
                onClick={() => handleChange("actif", !form.actif)}
              >
                <span className={styles.toggleThumb} />
                <span className={styles.toggleText}>
                  {form.actif ? "Actif" : "Inactif"}
                </span>
              </button>
            </div>
          )}

          {/* ── Image ───────────────────────────────────────────────────── */}
          {!isView ? (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Image du produit</label>
              {imagePreview ? (
                <div className={styles.imagePreviewWrapper}>
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    className={styles.imageRemoveBtn}
                    onClick={removeImage}
                    title="Supprimer l'image"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ) : (
                <div
                  className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""} ${errors.image ? styles.dropzoneError : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon />
                  <span className={styles.dropzoneText}>
                    Glissez une image ici ou{" "}
                    <span className={styles.dropzoneLink}>parcourir</span>
                  </span>
                  <span className={styles.dropzoneHint}>
                    JPG, PNG, WEBP — max 2 Mo
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className={styles.fileInputHidden}
                    onChange={handleFileInput}
                  />
                </div>
              )}
              {errors.image && (
                <span className={styles.errorMsg}>{errors.image}</span>
              )}
            </div>
          ) : initialData?.image ? (
            <div className={styles.fieldGroup}>
              <span className={styles.label}>Image</span>
              <div className={styles.imageViewWrapper}>
                <img
                  src={`${STORAGE_URL}/${initialData.image}`}
                  alt={form.nom}
                  className={styles.imageViewOnly}
                />
                <button
                  type="button"
                  className={styles.expandBtn}
                  onClick={() => setViewerOpen(true)}
                  title="Voir en plein écran"
                >
                  <ExpandIcon />
                  Voir en plein écran
                </button>
              </div>
            </div>
          ) : null}
          {viewerOpen && initialData?.image && (
            <ImageViewer
              src={`${STORAGE_URL}/${initialData.image}`}
              alt={form.nom}
              onClose={() => setViewerOpen(false)}
            />
          )}
          {/* ── Section : Identité ──────────────────────────────────────── */}
          <div className={styles.sectionTitle}>Identité</div>
          <div className={styles.grid2}>
            {/* Type */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="type">
                Type *
              </label>
              {isView ? (
                <ViewValue>
                  <span className={styles.typeTag}>
                    {TYPE_OPTIONS.find((t) => t.value === form.type)?.label ||
                      form.type ||
                      "—"}
                  </span>
                </ViewValue>
              ) : (
                <>
                  <select
                    id="type"
                    className={`${styles.input} ${errors.type ? styles.inputError : ""}`}
                    value={form.type || ""}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    <option value="">Sélectionner un type</option>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <span className={styles.errorMsg}>{errors.type}</span>
                  )}
                </>
              )}
            </div>

            {/* SKU */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="sku">
                SKU
                {!isView && !isEdit && form.type && (
                  <span className={styles.labelHint}> — auto-généré</span>
                )}
              </label>
              {isView ? (
                <ViewValue>
                  {form.sku ? (
                    <code className={styles.monoCode}>{form.sku}</code>
                  ) : null}
                </ViewValue>
              ) : (
                <>
                  <div className={styles.inputWithAddon}>
                    <span className={styles.inputAddon}>#</span>
                    <input
                      id="sku"
                      type="text"
                      className={`${styles.input} ${styles.inputAddonned}`}
                      value={form.sku || ""}
                      placeholder="Auto selon le type…"
                      onChange={(e) => handleChange("sku", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Nom — pleine largeur */}
            <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
              <label className={styles.label} htmlFor="nom">
                Nom *
              </label>
              {isView ? (
                <ViewValue>
                  <span className={styles.viewText}>{form.nom}</span>
                </ViewValue>
              ) : (
                <>
                  <input
                    id="nom"
                    type="text"
                    className={`${styles.input} ${errors.nom ? styles.inputError : ""}`}
                    value={form.nom || ""}
                    placeholder="Ex : Chaise ergonomique, Laptop Dell…"
                    onChange={(e) => handleChange("nom", e.target.value)}
                  />
                  {errors.nom && (
                    <span className={styles.errorMsg}>{errors.nom}</span>
                  )}
                </>
              )}
            </div>

            {/* Code-barres — pleine largeur */}
            <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
              <label className={styles.label} htmlFor="code_barre">
                Code-barres
              </label>
              {isView ? (
                <ViewValue>
                  {form.code_barre ? (
                    <code className={styles.monoCode}>{form.code_barre}</code>
                  ) : null}
                </ViewValue>
              ) : (
                <input
                  id="code_barre"
                  type="text"
                  className={styles.input}
                  value={form.code_barre || ""}
                  placeholder="EAN13, QR, ISBN…"
                  onChange={(e) => handleChange("code_barre", e.target.value)}
                />
              )}
            </div>
          </div>
          {/* /grid2 identité */}

          {/* ── Section : Prix & Stock ───────────────────────────────────── */}
          <div className={styles.sectionTitle}>Prix & Stock</div>
          <div className={styles.grid2}>
            {/* Prix HT */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="prix">
                Prix unitaire HT *
              </label>
              {isView ? (
                <ViewValue>
                  {form.prix_unitaire_ht != null
                    ? Number(form.prix_unitaire_ht).toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "MAD",
                      })
                    : null}
                </ViewValue>
              ) : (
                <>
                  <div className={styles.inputWithAddon}>
                    <span className={styles.inputAddon}>MAD</span>
                    <input
                      id="prix"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`${styles.input} ${styles.inputAddonned} ${errors.prix_unitaire_ht ? styles.inputError : ""}`}
                      value={form.prix_unitaire_ht || ""}
                      placeholder="0.00"
                      onChange={(e) =>
                        handleChange("prix_unitaire_ht", e.target.value)
                      }
                    />
                  </div>
                  {errors.prix_unitaire_ht && (
                    <span className={styles.errorMsg}>
                      {errors.prix_unitaire_ht}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Prix de revient */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="prix_revient">
                Prix de revient *
              </label>
              {isView ? (
                <ViewValue>
                  {form.prix_revient
                    ? Number(form.prix_revient).toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "MAD",
                      })
                    : null}
                </ViewValue>
              ) : (
                <>
                  <div className={styles.inputWithAddon}>
                    <span className={styles.inputAddon}>MAD</span>
                    <input
                      id="prix_revient"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`${styles.input} ${styles.inputAddonned} ${errors.prix_revient ? styles.inputError : ""}`}
                      value={form.prix_revient || ""}
                      placeholder="0.00"
                      onChange={(e) =>
                        handleChange("prix_revient", e.target.value)
                      }
                    />
                  </div>
                  {errors.prix_revient && (
                    <span className={styles.errorMsg}>
                      {errors.prix_revient}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* TVA */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="tva">
                TVA *
              </label>
              {isView ? (
                <ViewValue>
                  {form.tva != null ? `${Number(form.tva)} %` : null}
                </ViewValue>
              ) : (
                <>
                  <div className={styles.inputWithAddon}>
                    <span className={styles.inputAddon}>%</span>
                    <input
                      id="tva"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className={`${styles.input} ${styles.inputAddonned} ${errors.tva ? styles.inputError : ""}`}
                      value={form.tva || ""}
                      placeholder="20"
                      onChange={(e) => handleChange("tva", e.target.value)}
                    />
                  </div>
                  {errors.tva && (
                    <span className={styles.errorMsg}>{errors.tva}</span>
                  )}
                </>
              )}
            </div>

            {(isView || (form.prix_unitaire_ht && form.tva)) && (
              <div className={styles.fieldGroup}>
                <span className={styles.label}>Prix TTC (calculé)</span>
                <div
                  className={`${styles.viewValue} ${styles.viewValueAccent}`}
                >
                  {Number(
                    (parseFloat(form.prix_unitaire_ht) || 0) *
                      (1 + (parseFloat(form.tva) || 0) / 100),
                  ).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "MAD",
                  })}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="stock">
                Quantité en stock *
              </label>
              {isView ? (
                <ViewValue>
                  <span
                    className={
                      (form.quantite_stock ?? 0) < 10
                        ? styles.stockLow
                        : (form.quantite_stock ?? 0) < 50
                          ? styles.stockMid
                          : styles.stockOk
                    }
                  >
                    {form.quantite_stock ?? 0} unité
                    {(form.quantite_stock ?? 0) !== 1 ? "s" : ""}
                  </span>
                </ViewValue>
              ) : (
                <>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    className={`${styles.input} ${errors.quantite_stock ? styles.inputError : ""}`}
                    value={form.quantite_stock || ""}
                    placeholder="0"
                    onChange={(e) =>
                      handleChange("quantite_stock", e.target.value)
                    }
                  />
                  {errors.quantite_stock && (
                    <span className={styles.errorMsg}>
                      {errors.quantite_stock}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Seuil alerte stock */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="seuil">
                Seuil alerte stock
              </label>
              {isView ? (
                <ViewValue>
                  {form.seuil_alerte_stock ?? 10} unité
                  {(form.seuil_alerte_stock ?? 10) !== 1 ? "s" : ""}
                </ViewValue>
              ) : (
                <input
                  id="seuil"
                  type="number"
                  min="0"
                  step="1"
                  className={styles.input}
                  value={form.seuil_alerte_stock || ""}
                  placeholder="10"
                  onChange={(e) =>
                    handleChange("seuil_alerte_stock", e.target.value)
                  }
                />
              )}
            </div>
          </div>
          {/* /grid2 prix */}

          {/* ── Section : Classification ─────────────────────────────────── */}
          <div className={styles.sectionTitle}>Classification</div>
          <div className={styles.grid2}>
            {/* Catégorie */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="category">
                Catégorie *
              </label>
              {isView ? (
                <ViewValue>
                  {form.category?.name ||
                    categories.find((c) => c.id === Number(form.category_id))
                      ?.name ||
                    null}
                </ViewValue>
              ) : (
                <>
                  <select
                    id="category"
                    className={`${styles.input} ${errors.category_id ? styles.inputError : ""}`}
                    value={form.category_id || ""}
                    onChange={(e) =>
                      handleChange("category_id", e.target.value)
                    }
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <span className={styles.errorMsg}>
                      {errors.category_id}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Fournisseur */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="fournisseur">
                Fournisseur
              </label>
              {isView ? (
                <ViewValue>
                  {form.fournisseur?.nom ||
                    fournisseurs.find(
                      (f) => f.id === Number(form.fournisseur_id),
                    )?.nom ||
                    null}
                </ViewValue>
              ) : (
                <select
                  id="fournisseur"
                  className={styles.input}
                  value={form.fournisseur_id || ""}
                  onChange={(e) =>
                    handleChange("fournisseur_id", e.target.value)
                  }
                >
                  <option value="">Aucun fournisseur</option>
                  {fournisseurs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          {/* /grid2 classification */}

          {/* Description — pleine largeur */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="description">
              Description
            </label>
            {isView ? (
              <div className={`${styles.viewValue} ${styles.viewTextarea}`}>
                {form.description || (
                  <span className={styles.viewEmpty}>—</span>
                )}
              </div>
            ) : (
              <textarea
                id="description"
                className={`${styles.input} ${styles.textarea}`}
                value={form.description || ""}
                placeholder="Description optionnelle du produit…"
                rows={3}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            )}
          </div>

          {/* Statut — view only */}
          {isView && (
            <div className={styles.fieldGroup}>
              <span className={styles.label}>Statut</span>
              <span
                className={
                  form.actif ? styles.badgeActive : styles.badgeInactive
                }
              >
                <span className={styles.dot} />
                {form.actif ? "Actif" : "Inactif"}
              </span>
            </div>
          )}
        </div>
        {/* /body */}

        {/* ── Footer ──────────────────────────────────────────────────── */}
        {!isView && (
          <div className={styles.footer}>
            <button
              className={styles.cancelBtn}
              type="button"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              className={styles.submitBtn}
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <span className={styles.spinner} /> : <SaveIcon />}
              {loading
                ? "Enregistrement…"
                : mode === "create"
                  ? "Créer le produit"
                  : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
