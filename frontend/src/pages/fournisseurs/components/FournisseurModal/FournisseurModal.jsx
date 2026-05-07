import { useState, useEffect, useCallback } from "react";
import styles from "./FournisseurModal.module.css";

/* ── Icons ─────────────────────────────────────────────────────────────── */
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

/* ── Champs du formulaire ──────────────────────────────────────────────── */
const FORM_SECTIONS = [
  {
    title: "Identité",
    fields: [
      { key: "nom",         label: "Nom *",               type: "text",     placeholder: "Raison sociale", required: true, col: 2 },
      { key: "contact_nom", label: "Nom du contact",       type: "text",     placeholder: "Prénom Nom",     col: 2 },
      { key: "description", label: "Description",          type: "textarea", placeholder: "Activité, notes…", col: 1 },
    ],
  },
  {
    title: "Coordonnées",
    fields: [
      { key: "email",     label: "Email",     type: "email", placeholder: "contact@exemple.ma", col: 2 },
      { key: "telephone", label: "Téléphone", type: "text",  placeholder: "+212 6XX XXX XXX",   col: 2 },
      { key: "adresse",   label: "Adresse",   type: "text",  placeholder: "Rue, quartier…",     col: 2 },
      { key: "ville",     label: "Ville",     type: "text",  placeholder: "Ex : Tanger",        col: 2 },
    ],
  },
  {
    title: "Fiscal",
    fields: [
      { key: "ice",                label: "ICE",                  type: "text", placeholder: "15 chiffres",  col: 2 },
      { key: "identifiant_fiscal", label: "Identifiant Fiscal",   type: "text", placeholder: "IF…",          col: 2 },
    ],
  },
];

const EMPTY_FORM = {
  nom: "", contact_nom: "", description: "",
  email: "", telephone: "", adresse: "", ville: "",
  ice: "", identifiant_fiscal: "", actif: true,
};

/* ══════════════════════════════════════════════════════════════════════════ */
export default function FournisseurModal({
  mode = "create",
  initialData = null,
  onClose,
  onSubmit,
  loading = false,
}) {
  const isView = mode === "view";
  const title  = mode === "create" ? "Nouveau fournisseur"
               : mode === "edit"   ? "Modifier le fournisseur"
               :                     "Détails du fournisseur";

  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  /* Pré-remplir en mode edit/view */
  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        actif: initialData.actif ?? true,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  /* Fermer sur Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Handlers ──────────────────────────────────────────────────────────── */
  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  }, [errors]);

  const validate = () => {
    const errs = {};
    if (!form.nom?.trim()) errs.nom = "Le nom est obligatoire";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Email invalide";
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={`${styles.modeBadge} ${styles[`modeBadge--${mode}`]}`}>
              {mode === "create" ? "NOUVEAU" : mode === "edit" ? "MODIFIER" : "VUE"}
            </div>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Statut toggle — seulement en create/edit */}
          {!isView && (
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Statut du fournisseur</span>
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

          {/* Sections */}
          {FORM_SECTIONS.map((section) => (
            <div key={section.title} className={styles.section}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <div className={styles.grid}>
                {section.fields.map((field) => (
                  <div
                    key={field.key}
                    className={`${styles.fieldGroup} ${field.col === 1 ? styles.colFull : ""}`}
                  >
                    <label className={styles.label} htmlFor={field.key}>
                      {field.label}
                    </label>

                    {/* View mode : texte simple */}
                    {isView ? (
                      <div className={styles.viewValue}>
                        {form[field.key] || <span className={styles.viewEmpty}>—</span>}
                      </div>
                    ) : field.type === "textarea" ? (
                      <textarea
                        id={field.key}
                        className={`${styles.input} ${styles.textarea} ${errors[field.key] ? styles.inputError : ""}`}
                        value={form[field.key] || ""}
                        placeholder={field.placeholder}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <input
                        id={field.key}
                        type={field.type}
                        className={`${styles.input} ${errors[field.key] ? styles.inputError : ""}`}
                        value={form[field.key] || ""}
                        placeholder={field.placeholder}
                        required={field.required}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    )}

                    {errors[field.key] && (
                      <span className={styles.errorMsg}>{errors[field.key]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* View : statut */}
          {isView && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Statut</h3>
              <span className={form.actif ? styles.badgeActive : styles.badgeInactive}>
                <span className={styles.dot} />
                {form.actif ? "Actif" : "Inactif"}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isView && (
          <div className={styles.footer}>
            <button className={styles.cancelBtn} type="button" onClick={onClose}>
              Annuler
            </button>
            <button
              className={styles.submitBtn}
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <SaveIcon />
              )}
              {loading
                ? "Enregistrement…"
                : mode === "create" ? "Créer le fournisseur" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}