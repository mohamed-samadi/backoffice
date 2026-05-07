import { useState, useEffect, useCallback } from "react";
import styles from "./TaskCategoryModal.module.css";

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

const PRESET_COLORS = [
  "#4f7fff","#a855f7","#22c55e","#ef4444",
  "#f59e0b","#06b6d4","#14b8a6","#ec4899",
  "#8b5cf6","#f97316","#64748b","#10b981",
];

const EMPTY_FORM = { name: "", color: "", description: "", is_active: true };

export default function TaskCategoryModal({
  mode        = "create",
  initialData = null,
  onClose,
  onSubmit,
  loading     = false,
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
    if (!form.name?.trim())          errs.name = "Le nom est obligatoire";
    if (form.name?.trim().length > 255) errs.name = "Max 255 caractères";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({
      name:        form.name.trim(),
      color:       form.color       || null,
      description: form.description || null,
      is_active:   form.is_active,
    });
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

          {/* Nom */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="cat-name">Nom *</label>
            {isView ? (
              <div className={styles.viewValue}>
                {form.color && <span className={styles.viewColorDot} style={{ background: form.color }} />}
                <span className={styles.viewText}>{form.name}</span>
              </div>
            ) : (
              <>
                <input
                  id="cat-name"
                  type="text"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  value={form.name || ""}
                  placeholder="Ex : Développement, Marketing…"
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
              </>
            )}
          </div>

          {/* Couleur */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Couleur</label>
            {isView ? (
              <div className={styles.viewValue}>
                {form.color ? (
                  <>
                    <span className={styles.colorSwatch} style={{ background: form.color }} />
                    <code className={styles.colorCode}>{form.color}</code>
                  </>
                ) : <span className={styles.viewEmpty}>—</span>}
              </div>
            ) : (
              <div className={styles.colorSection}>
                {/* Presets */}
                <div className={styles.colorPresets}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.presetColor} ${form.color === c ? styles.presetColorActive : ""}`}
                      style={{ background: c }}
                      onClick={() => handleChange("color", c)}
                      title={c}
                    />
                  ))}
                  {/* Custom color input */}
                  <label className={styles.customColorBtn} title="Couleur personnalisée">
                    <input
                      type="color"
                      value={form.color || "#4f7fff"}
                      onChange={(e) => handleChange("color", e.target.value)}
                      className={styles.colorInputHidden}
                    />
                    <span>+</span>
                  </label>
                </div>
                {/* Preview */}
                {form.color && (
                  <div className={styles.colorPreviewRow}>
                    <span className={styles.colorSwatch} style={{ background: form.color }} />
                    <code className={styles.colorCode}>{form.color}</code>
                    <button
                      type="button"
                      className={styles.clearColor}
                      onClick={() => handleChange("color", "")}
                    >
                      Effacer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="cat-desc">Description</label>
            {isView ? (
              <div className={`${styles.viewValue} ${styles.viewTextarea}`}>
                {form.description || <span className={styles.viewEmpty}>—</span>}
              </div>
            ) : (
              <textarea
                id="cat-desc"
                className={`${styles.input} ${styles.textarea}`}
                value={form.description || ""}
                placeholder="Description optionnelle…"
                rows={3}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            )}
          </div>

          {/* Statut view */}
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
              {loading ? "Enregistrement…" : mode === "create" ? "Créer" : "Enregistrer"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}