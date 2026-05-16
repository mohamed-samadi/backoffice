import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./ChequeModal.module.css";
import  ImageViewer from "../../../../components/common/imageviewer/ImageViewer";
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ExpandIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const STATUT_OPTIONS = [
  { value: "non_encaisse", label: "Non encaissé", color: "var(--color-purple)" },
  { value: "encaisse",     label: "Encaissé",     color: "var(--color-green)"  },
  { value: "impaye",       label: "Impayé",       color: "var(--color-red)"    },
  { value: "annule",       label: "Annulé",       color: "var(--color-amber)"  },
];

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";

const EMPTY_FORM = {
  numero_cheque:    "",
  banque:           "",
  titulaire:        "",
  montant:          "",
  date_emission:    "",
  date_echeance:    "",
  date_encaissement:"",
  statut:           "non_encaisse",
  client_id:        "",
  notes:            "",
};

export default function ChequeModal({
  mode        = "create",
  initialData = null,
  clients     = [],
  onClose,
  onSubmit,
  loading     = false,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const title  = mode === "create" ? "Nouveau chèque"
               : mode === "edit"   ? "Modifier le chèque"
               :                     "Détails du chèque";

  const fileInputRef = useRef(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState({});
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver,     setDragOver]     = useState(false);

  /* ── Init ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        client_id:         initialData.client?.id ?? initialData.client_id ?? "",
        date_emission:     initialData.date_emission?.slice(0, 10)     || "",
        date_echeance:     initialData.date_echeance?.slice(0, 10)     || "",
        date_encaissement: initialData.date_encaissement?.slice(0, 10) || "",
      });
      if (initialData.image) setImagePreview(`${STORAGE_URL}/${initialData.image}`);
      else setImagePreview(null);
    } else {
      setForm(EMPTY_FORM);
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
  }, [initialData]);

  /* ── Escape ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  /* ── Cleanup blob ─────────────────────────────────────────────────────── */
  useEffect(() => {
    return () => { if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const handleChange = useCallback((key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
  }, [errors]);

  const handleImageFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "Fichier image requis" })); return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "Image trop lourde (max 4 Mo)" })); return;
    }
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, image: null }));
  }, [imagePreview]);

  const removeImage = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Validation ───────────────────────────────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!form.numero_cheque?.trim()) errs.numero_cheque = "Le numéro est obligatoire";
    if (!form.banque?.trim())        errs.banque        = "La banque est obligatoire";
    if (!form.titulaire?.trim())     errs.titulaire     = "Le titulaire est obligatoire";
    if (!form.montant || Number(form.montant) <= 0)
                                     errs.montant       = "Montant invalide";
    if (!form.date_echeance)         errs.date_echeance = "La date d'échéance est obligatoire";
    return errs;
  };

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const fd = new FormData();
    if (isEdit) fd.append("_method", "PUT");
    fd.append("numero_cheque",    form.numero_cheque.trim());
    fd.append("banque",           form.banque.trim());
    fd.append("titulaire",        form.titulaire.trim());
    fd.append("montant",          form.montant);
    fd.append("date_echeance",    form.date_echeance);
    fd.append("statut",           form.statut);
    if (form.date_emission)      fd.append("date_emission",     form.date_emission);
    if (form.date_encaissement)  fd.append("date_encaissement", form.date_encaissement);
    if (form.client_id)          fd.append("client_id",         form.client_id);
    if (form.notes)              fd.append("notes",             form.notes);
    if (imageFile)               fd.append("image",             imageFile);

    onSubmit(fd);
  };

  const ViewValue = ({ children }) => (
    <div className={styles.viewValue}>
      {children ?? <span className={styles.viewEmpty}>—</span>}
    </div>
  );
const [viewerOpen, setViewerOpen] = useState(false);
  const statutMeta = STATUT_OPTIONS.find((s) => s.value === form.statut);

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={`${styles.modeBadge} ${styles[`modeBadge--${mode}`]}`}>
              {mode === "create" ? "NOUVEAU" : mode === "edit" ? "MODIFIER" : "VUE"}
            </div>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><XIcon /></button>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* ── Image chèque ──────────────────────────────────────────── */}
          {!isView ? (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Photo du chèque</label>
              {imagePreview ? (
                <div className={styles.imagePreviewWrapper}>
                  <img src={imagePreview} alt="Chèque" className={styles.imagePreview} />
                  <button type="button" className={styles.imageRemoveBtn} onClick={removeImage}>
                    <TrashIcon />
                  </button>
                </div>
              ) : (
                <div
                  className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ""} ${errors.image ? styles.dropzoneError : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files?.[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon />
                  <span className={styles.dropzoneText}>
                    Glissez la photo du chèque ou <span className={styles.dropzoneLink}>parcourir</span>
                  </span>
                  <span className={styles.dropzoneHint}>JPG, PNG — max 4 Mo</span>
                  <input ref={fileInputRef} type="file" accept="image/*" className={styles.fileInputHidden} onChange={(e) => handleImageFile(e.target.files?.[0])} />
                </div>
              )}
              {errors.image && <span className={styles.errorMsg}>{errors.image}</span>}
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

          {/* ── Section : Informations chèque ─────────────────────────── */}
          <div className={styles.sectionTitle}>Informations du chèque</div>
          <div className={styles.grid2}>

            {/* Numéro */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="numero">Numéro *</label>
              {isView ? (
                <ViewValue><code className={styles.monoCode}>{form.numero_cheque}</code></ViewValue>
              ) : (
                <>
                  <input id="numero" type="text"
                    className={`${styles.input} ${errors.numero_cheque ? styles.inputError : ""}`}
                    value={form.numero_cheque || ""} placeholder="Ex : CHQ-001234"
                    onChange={(e) => handleChange("numero_cheque", e.target.value)} />
                  {errors.numero_cheque && <span className={styles.errorMsg}>{errors.numero_cheque}</span>}
                </>
              )}
            </div>

            {/* Banque */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="banque">Banque *</label>
              {isView ? (
                <ViewValue>{form.banque}</ViewValue>
              ) : (
                <>
                  <input id="banque" type="text"
                    className={`${styles.input} ${errors.banque ? styles.inputError : ""}`}
                    value={form.banque || ""} placeholder="Ex : CIH Bank, Attijariwafa…"
                    onChange={(e) => handleChange("banque", e.target.value)} />
                  {errors.banque && <span className={styles.errorMsg}>{errors.banque}</span>}
                </>
              )}
            </div>

            {/* Titulaire — pleine largeur */}
            <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
              <label className={styles.label} htmlFor="titulaire">Titulaire *</label>
              {isView ? (
                <ViewValue><span className={styles.viewText}>{form.titulaire}</span></ViewValue>
              ) : (
                <>
                  <input id="titulaire" type="text"
                    className={`${styles.input} ${errors.titulaire ? styles.inputError : ""}`}
                    value={form.titulaire || ""} placeholder="Nom du porteur du chèque"
                    onChange={(e) => handleChange("titulaire", e.target.value)} />
                  {errors.titulaire && <span className={styles.errorMsg}>{errors.titulaire}</span>}
                </>
              )}
            </div>

            {/* Montant */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="montant">Montant *</label>
              {isView ? (
                <ViewValue>
                  <span className={styles.amountText}>
                    {form.montant != null
                      ? Number(form.montant).toLocaleString("fr-FR", { style: "currency", currency: "MAD" })
                      : null}
                  </span>
                </ViewValue>
              ) : (
                <>
                  <div className={styles.inputWithAddon}>
                    <span className={styles.inputAddon}>MAD</span>
                    <input id="montant" type="number" min="0" step="0.01"
                      className={`${styles.input} ${styles.inputAddonned} ${errors.montant ? styles.inputError : ""}`}
                      value={form.montant || ""} placeholder="0.00"
                      onChange={(e) => handleChange("montant", e.target.value)} />
                  </div>
                  {errors.montant && <span className={styles.errorMsg}>{errors.montant}</span>}
                </>
              )}
            </div>

            {/* Statut */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Statut</label>
              {isView ? (
                <ViewValue>
                  <span className={styles.statutTag} style={{ color: statutMeta?.color }}>
                    <span className={styles.statutDot} style={{ background: statutMeta?.color }} />
                    {statutMeta?.label || form.statut}
                  </span>
                </ViewValue>
              ) : (
                <select className={styles.input} value={form.statut || "non_encaisse"}
                  onChange={(e) => handleChange("statut", e.target.value)}>
                  {STATUT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              )}
            </div>

          </div>

          {/* ── Section : Dates ────────────────────────────────────────── */}
          <div className={styles.sectionTitle}>Dates</div>
          <div className={styles.grid3}>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="date_emission">Date d'émission</label>
              {isView ? (
                <ViewValue>
                  {form.date_emission
                    ? new Date(form.date_emission).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                    : null}
                </ViewValue>
              ) : (
                <input id="date_emission" type="date" className={styles.input}
                  value={form.date_emission || ""}
                  onChange={(e) => handleChange("date_emission", e.target.value)} />
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="date_echeance">Date d'échéance *</label>
              {isView ? (
                <ViewValue>
                  {form.date_echeance
                    ? new Date(form.date_echeance).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                    : null}
                </ViewValue>
              ) : (
                <>
                  <input id="date_echeance" type="date"
                    className={`${styles.input} ${errors.date_echeance ? styles.inputError : ""}`}
                    value={form.date_echeance || ""}
                    onChange={(e) => handleChange("date_echeance", e.target.value)} />
                  {errors.date_echeance && <span className={styles.errorMsg}>{errors.date_echeance}</span>}
                </>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="date_encaissement">Date d'encaissement</label>
              {isView ? (
                <ViewValue>
                  {form.date_encaissement
                    ? new Date(form.date_encaissement).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                    : null}
                </ViewValue>
              ) : (
                <input id="date_encaissement" type="date" className={styles.input}
                  value={form.date_encaissement || ""}
                  onChange={(e) => handleChange("date_encaissement", e.target.value)} />
              )}
            </div>

          </div>

          {/* ── Section : Client & Notes ───────────────────────────────── */}
          <div className={styles.sectionTitle}>Client & Notes</div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="client">Client associé</label>
            {isView || isEdit ? (
              <ViewValue>
                {form.client?.nom_complet
                  || clients.find((c) => c.id === Number(form.client_id))?.nom_complet
                  || null}
              </ViewValue>
            ) : (
              <select id="client" className={styles.input}
                value={form.client_id || ""}
                onChange={(e) => handleChange("client_id", e.target.value)}>
                <option value="">Aucun client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom_complet}</option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="notes">Notes</label>
            {isView ? (
              <div className={`${styles.viewValue} ${styles.viewTextarea}`}>
                {form.notes || <span className={styles.viewEmpty}>—</span>}
              </div>
            ) : (
              <textarea id="notes" className={`${styles.input} ${styles.textarea}`}
                value={form.notes || ""} placeholder="Remarques optionnelles…" rows={3}
                onChange={(e) => handleChange("notes", e.target.value)} />
            )}
          </div>

        </div>{/* /body */}

        {/* Footer */}
        {!isView && (
          <div className={styles.footer}>
            <button className={styles.cancelBtn} type="button" onClick={onClose}>Annuler</button>
            <button className={styles.submitBtn} type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : <SaveIcon />}
              {loading ? "Enregistrement…" : mode === "create" ? "Créer le chèque" : "Enregistrer"}
            </button>
          </div>
        )}
        {viewerOpen && (
  <ImageViewer
    src={`${STORAGE_URL}/${initialData.image}`}
    alt={`Chèque ${initialData.numero_cheque}`}
    onClose={() => setViewerOpen(false)}
  />
)}
      </div>
    </div>
  );
}