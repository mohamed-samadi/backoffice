import { useState, useEffect, useCallback } from "react";
import styles from "./CategoryModal.module.css";

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const EMPTY_FORM = { name: "", description: "", is_active: true };

export default function CategoryModal({
  mode = "create",
  initialData = null,
  onClose,
  onSubmit,
  loading = false,
}) {
  const isView = mode === "view";
  const title  = mode === "create" ? "Nouvelle catégorie"
               : mode === "edit"   ? "Modifier la catégorie"
               :                     "Détails de la catégorie";

  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
    setErrors({});
  }, [initialData]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  }, [errors]);

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Le nom est obligatoire";
    if (form.name?.trim().length > 255) errs.name = "Max 255 caractères";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal}>

        {/* Header */}
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

          {/* Toggle statut */}
          {!isView && (
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Statut de la catégorie</span>
              <button
                type="button"
                className={`${styles.toggle} ${form.is_active ? styles.toggleOn : styles.toggleOff}`}
                onClick={() => handleChange("is_active", !form.is_active)}
              >
                <span className={styles.toggleThumb} />
                <span className={styles.toggleText}>
                  {form.is_active ? "Active" : "Inactive"}
                </span>
              </button>
            </div>
          )}

          {/* Champ : Nom */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name">
              Nom *
            </label>
            {isView ? (
              <div className={styles.viewValue}>{form.name || <span className={styles.viewEmpty}>—</span>}</div>
            ) : (
              <input
                id="name"
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                value={form.name || ""}
                placeholder="Ex : Électronique, Mobilier…"
                onChange={(e) => handleChange("name", e.target.value)}
              />
            )}
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          {/* Champ : Description */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="description">
              Description
            </label>
            {isView ? (
              <div className={`${styles.viewValue} ${styles.viewTextarea}`}>
                {form.description || <span className={styles.viewEmpty}>—</span>}
              </div>
            ) : (
              <textarea
                id="description"
                className={`${styles.input} ${styles.textarea}`}
                value={form.description || ""}
                placeholder="Description optionnelle de la catégorie…"
                rows={4}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            )}
          </div>

          {/* Statut en mode view */}
          {isView && (
            <div className={styles.fieldGroup}>
              <span className={styles.label}>Statut</span>
              <span className={form.is_active ? styles.badgeActive : styles.badgeInactive}>
                <span className={styles.dot} />
                {form.is_active ? "Active" : "Inactive"}
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
              {loading ? <span className={styles.spinner} /> : <SaveIcon />}
              {loading
                ? "Enregistrement…"
                : mode === "create" ? "Créer la catégorie" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}