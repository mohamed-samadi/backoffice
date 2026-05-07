import { useState, useEffect, useCallback } from "react";
import styles from "./TaskModal.module.css";

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

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Faible",  color: "var(--color-text-muted)" },
  { value: "normal", label: "Normal",  color: "var(--color-cyan)"       },
  { value: "high",   label: "Élevée",  color: "var(--color-amber)"      },
  { value: "urgent", label: "Urgente", color: "var(--color-red)"        },
];

const STATUS_OPTIONS = [
  { value: "todo",        label: "À faire",  color: "var(--color-purple)" },
  { value: "in_progress", label: "En cours", color: "var(--color-cyan)"   },
  { value: "completed",   label: "Terminée", color: "var(--color-green)"  },
];

const EMPTY_FORM = {
  title:           "",
  notes:           "",
  priority:        "normal",
  status:          "todo",
  due_date:        "",
  task_category_id:"",
  client_id:       "",
};

export default function TaskModal({
  mode        = "create",
  initialData = null,
  categories  = [],
  clients   ,
  onClose,
  onSubmit,
  loading     = false,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const title  = mode === "create" ? "Nouvelle tâche"
               : mode === "edit"   ? "Modifier la tâche"
               :                     "Détails de la tâche";

  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  /* ── Init ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        task_category_id: initialData.category?.id ?? initialData.task_category_id ?? "",
        client_id:        initialData.client?.id   ?? initialData.client_id        ?? "",
        due_date:         initialData.due_date
          ? initialData.due_date.slice(0, 10)
          : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initialData]);

  /* ── Escape ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const handleChange = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  }, [errors]);

  /* ── Validation ───────────────────────────────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!form.title?.trim())          errs.title = "Le titre est obligatoire";
    if (form.title?.trim().length > 255) errs.title = "Max 255 caractères";
    return errs;
  };

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      title:            form.title.trim(),
      notes:            form.notes            || null,
      priority:         form.priority         || "normal",
      status:           form.status           || "todo",
      due_date:         form.due_date         || null,
      task_category_id: form.task_category_id || null,
      client_id:        form.client_id        || null,
    };

    onSubmit(payload);
  };

  /* ── Helpers render ───────────────────────────────────────────────────── */
  const getPriorityStyle = (val) => {
    const opt = PRIORITY_OPTIONS.find((o) => o.value === val);
    return opt ? opt.color : "var(--color-text-muted)";
  };
  const getStatusStyle = (val) => {
    const opt = STATUS_OPTIONS.find((o) => o.value === val);
    return opt ? opt.color : "var(--color-text-muted)";
  };

  const ViewValue = ({ children }) => (
    <div className={styles.viewValue}>
      {children ?? <span className={styles.viewEmpty}>—</span>}
    </div>
  );

  /* ── Render ───────────────────────────────────────────────────────────── */
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

          {/* ── Titre ─────────────────────────────────────────────────── */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="title">Titre *</label>
            {isView ? (
              <ViewValue><span className={styles.viewText}>{form.title}</span></ViewValue>
            ) : (
              <>
                <input
                  id="title"
                  type="text"
                  className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                  value={form.title || ""}
                  placeholder="Ex : Préparer la réunion client…"
                  onChange={(e) => handleChange("title", e.target.value)}
                />
                {errors.title && <span className={styles.errorMsg}>{errors.title}</span>}
              </>
            )}
          </div>

          {/* ── Grille : Priorité + Statut ────────────────────────────── */}
          <div className={styles.grid2}>

            {/* Priorité */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="priority">Priorité</label>
              {isView ? (
                <ViewValue>
                  <span className={styles.priorityTag} style={{ color: getPriorityStyle(form.priority) }}>
                    <span className={styles.priorityDot} style={{ background: getPriorityStyle(form.priority) }} />
                    {PRIORITY_OPTIONS.find((o) => o.value === form.priority)?.label || form.priority}
                  </span>
                </ViewValue>
              ) : (
                <div className={styles.optionGroup}>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.optionBtn} ${form.priority === opt.value ? styles.optionBtnActive : ""}`}
                      style={form.priority === opt.value ? { borderColor: opt.color, color: opt.color } : {}}
                      onClick={() => handleChange("priority", opt.value)}
                    >
                      <span className={styles.optionDot} style={{ background: opt.color }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Statut */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="status">Statut</label>
              {isView ? (
                <ViewValue>
                  <span className={styles.statusTag} style={{ color: getStatusStyle(form.status) }}>
                    <span className={styles.priorityDot} style={{ background: getStatusStyle(form.status) }} />
                    {STATUS_OPTIONS.find((o) => o.value === form.status)?.label || form.status}
                  </span>
                </ViewValue>
              ) : (
                <div className={styles.optionGroup}>
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.optionBtn} ${form.status === opt.value ? styles.optionBtnActive : ""}`}
                      style={form.status === opt.value ? { borderColor: opt.color, color: opt.color } : {}}
                      onClick={() => handleChange("status", opt.value)}
                    >
                      <span className={styles.optionDot} style={{ background: opt.color }} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── Grille : Catégorie + Date ─────────────────────────────── */}
          <div className={styles.grid2}>

            {/* Catégorie */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="category">Catégorie</label>
              {isView ? (
                <ViewValue>
                  {(() => {
                    const cat = form.category
                      || categories.find((c) => c.id === Number(form.task_category_id));
                    return cat ? (
                      <span className={styles.catTag} style={{ borderColor: cat.color || "var(--color-border)" }}>
                        {cat.color && (
                          <span className={styles.catDot} style={{ background: cat.color }} />
                        )}
                        {cat.name}
                      </span>
                    ) : null;
                  })()}
                </ViewValue>
              ) : (
                <select
                  id="category"
                  className={styles.input}
                  value={form.task_category_id || ""}
                  onChange={(e) => handleChange("task_category_id", e.target.value)}
                >
                  <option value="">Aucune catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Date d'échéance */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="due_date">Date d'échéance</label>
              {isView ? (
                <ViewValue>
                  {form.due_date
                    ? new Date(form.due_date).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "long", year: "numeric",
                      })
                    : null}
                </ViewValue>
              ) : (
                <input
                  id="due_date"
                  type="date"
                  className={styles.input}
                  value={form.due_date || ""}
                  onChange={(e) => handleChange("due_date", e.target.value)}
                />
              )}
            </div>

          </div>

          {/* ── Client ────────────────────────────────────────────────── */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="client">Client associé</label>
            {isView ? (
              <ViewValue>
                {form.client?.nom
                  || clients.find((c) => c.id === Number(form.client_id))?.nom
                  || null}
              </ViewValue>
            ) : (
              <select
                id="client"
                className={styles.input}
                value={form.client_id || ""}
                onChange={(e) => handleChange("client_id", e.target.value)}
              >
                <option value="">Aucun client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom_complet}</option>
                ))}
              </select>
            )}
          </div>

          {/* ── Notes ─────────────────────────────────────────────────── */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="notes">Notes</label>
            {isView ? (
              <div className={`${styles.viewValue} ${styles.viewTextarea}`}>
                {form.notes || <span className={styles.viewEmpty}>—</span>}
              </div>
            ) : (
              <textarea
                id="notes"
                className={`${styles.input} ${styles.textarea}`}
                value={form.notes || ""}
                placeholder="Notes ou détails supplémentaires…"
                rows={4}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            )}
          </div>

          {/* ── Timestamps en mode view ────────────────────────────────── */}
          {isView && (initialData?.started_at || initialData?.completed_at) && (
            <div className={styles.grid2}>
              {initialData.started_at && (
                <div className={styles.fieldGroup}>
                  <span className={styles.label}>Démarrée le</span>
                  <ViewValue>
                    {new Date(initialData.started_at).toLocaleString("fr-FR")}
                  </ViewValue>
                </div>
              )}
              {initialData.completed_at && (
                <div className={styles.fieldGroup}>
                  <span className={styles.label}>Terminée le</span>
                  <ViewValue>
                    {new Date(initialData.completed_at).toLocaleString("fr-FR")}
                  </ViewValue>
                </div>
              )}
            </div>
          )}

        </div>{/* /body */}

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
                : mode === "create" ? "Créer la tâche" : "Enregistrer"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}