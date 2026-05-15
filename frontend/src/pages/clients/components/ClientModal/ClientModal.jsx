import { useState, useEffect, useCallback } from "react";
import styles from "./ClientModal.module.css";
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
const UserIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EMPTY_FORM = {
  nom_complet: "",
  nom_entreprise: "",
  telephone: "",
  email: "",
  adresse: "",
  ice: "",
  identifiant_fiscal: "",
  statut: "active",
};

export default function ClientModal({
  mode = "create",
  initialData = null,
  onClose,
  onSubmit,
  loading = false,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const title =
    mode === "create"
      ? "Nouveau client"
      : mode === "edit"
        ? "Modifier le client"
        : "Détails du client";

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  /* ── Init ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
    setErrors({});
  }, [initialData]);

  /* ── Escape ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const handleChange = useCallback(
    (key, value) => {
      setForm((p) => ({ ...p, [key]: value }));
      if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
    },
    [errors],
  );

  /* ── Validation front ─────────────────────────────────────────────────── */
  const validate = () => {
    const errs = {};
    if (!form.nom_complet?.trim())
      errs.nom_complet = "Le nom complet est obligatoire";
    if (form.nom_complet?.trim().length > 255)
      errs.nom_complet = "Max 255 caractères";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Adresse email invalide";
    return errs;
  };

  /* ── Submit ───────────────────────────────────────────────────────────── */
  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      nom_complet: form.nom_complet.trim(),
      nom_entreprise: form.nom_entreprise || null,
      telephone: form.telephone || null,
      email: form.email || null,
      adresse: form.adresse || null,
      ice: form.ice || null,
      identifiant_fiscal: form.identifiant_fiscal || null,
      statut: form.statut || "active",
    });
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        {/* Header */}
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

        {/* Body */}
        <div className={styles.body}>
          {/* Avatar initiales */}
          <div className={styles.avatarSection}>
            <div
              className={`${styles.avatar} ${form.statut === "active" ? styles.avatarActive : styles.avatarInactive}`}
            >
              {form.nom_complet?.charAt(0)?.toUpperCase() || <UserIcon />}
            </div>
            <div className={styles.avatarInfo}>
              <span className={styles.avatarName}>
                {form.nom_complet || (
                  <span className={styles.viewEmpty}>Nom du client</span>
                )}
              </span>
              {form.nom_entreprise && (
                <span className={styles.avatarEntreprise}>
                  {form.nom_entreprise}
                </span>
              )}
            </div>
            {/* Toggle statut */}
            {!isView && (
              <button
                type="button"
                className={`${styles.toggle} ${form.statut === "active" ? styles.toggleOn : styles.toggleOff}`}
                onClick={() =>
                  handleChange(
                    "statut",
                    form.statut === "active" ? "inactive" : "active",
                  )
                }
              >
                <span className={styles.toggleThumb} />
                <span className={styles.toggleText}>
                  {form.statut === "active" ? "Actif" : "Inactif"}
                </span>
              </button>
            )}
            {isView && (
              <span
                className={
                  form.statut === "active"
                    ? styles.badgeActive
                    : styles.badgeInactive
                }
              >
                <span className={styles.dot} />
                {form.statut === "active" ? "Actif" : "Inactif"}
              </span>
            )}
          </div>

          {/* ── Section : Identité ──────────────────────────────────────── */}
          <div className={styles.sectionTitle}>Identité</div>
          <div className={styles.grid2}>
            {/* Nom complet */}
            <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
              <label className={styles.label} htmlFor="nom_complet">
                Nom complet *
              </label>
              {isView ? (
                <ViewValue>
                  <span className={styles.viewText}>{form.nom_complet}</span>
                </ViewValue>
              ) : (
                <>
                  <input
                    id="nom_complet"
                    type="text"
                    className={`${styles.input} ${errors.nom_complet ? styles.inputError : ""}`}
                    value={form.nom_complet || ""}
                    placeholder="Prénom et nom…"
                    onChange={(e) =>
                      handleChange("nom_complet", e.target.value)
                    }
                  />
                  {errors.nom_complet && (
                    <span className={styles.errorMsg}>
                      {errors.nom_complet}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Entreprise */}
            <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
              <label className={styles.label} htmlFor="nom_entreprise">
                Entreprise
              </label>
              {isView ? (
                <ViewValue>{form.nom_entreprise || null}</ViewValue>
              ) : (
                <input
                  id="nom_entreprise"
                  type="text"
                  className={styles.input}
                  value={form.nom_entreprise || ""}
                  placeholder="Nom de la société (optionnel)…"
                  onChange={(e) =>
                    handleChange("nom_entreprise", e.target.value)
                  }
                />
              )}
            </div>
          </div>

          {/* ── Section : Contact ───────────────────────────────────────── */}
          <div className={styles.sectionTitle}>Contact</div>
          <div className={styles.grid2}>
            {/* Téléphone */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="telephone">
                Téléphone
              </label>
              {isView ? (
                <ViewValue>
                  {form.telephone ? (
                    <a
                      href={`${form.telephone}`}
                      className={styles.contactLink}
                    >
                      {form.telephone}
                    </a>
                  ) : null}
                </ViewValue>
              ) : (
                <div className={styles.inputWithAddon}>
                  <span className={styles.inputAddon}>📞</span>
                  <input
                    id="telephone"
                    type="tel"
                    className={`${styles.input} ${styles.inputAddonned}`}
                    value={form.telephone || ""}
                    placeholder="+212 6XX XXX XXX"
                    onChange={(e) => handleChange("telephone", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Email */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              {isView ? (
                <ViewValue>
                  {form.email ? (
                    <a
                      href={`mailto:${form.email}`}
                      className={styles.contactLink}
                    >
                      {form.email}
                    </a>
                  ) : null}
                </ViewValue>
              ) : (
                <>
                  <div className={styles.inputWithAddon}>
                    <span className={styles.inputAddon}>@</span>
                    <input
                      id="email"
                      type="email"
                      className={`${styles.input} ${styles.inputAddonned} ${errors.email ? styles.inputError : ""}`}
                      value={form.email || ""}
                      placeholder="client@exemple.com"
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <span className={styles.errorMsg}>{errors.email}</span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Section : Adresse ───────────────────────────────────────── */}
          <div className={styles.sectionTitle}>Adresse</div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="adresse">
              Adresse complète
            </label>
            {isView ? (
              <div className={`${styles.viewValue} ${styles.viewTextarea}`}>
                {form.adresse || <span className={styles.viewEmpty}>—</span>}
              </div>
            ) : (
              <textarea
                id="adresse"
                className={`${styles.input} ${styles.textarea}`}
                value={form.adresse || ""}
                placeholder="Rue, ville, code postal…"
                rows={3}
                onChange={(e) => handleChange("adresse", e.target.value)}
              />
            )}
          </div>

          {/* ── Section : Fiscal ────────────────────────────────────────── */}
          <div className={styles.sectionTitle}>Fiscal</div>
          <div className={styles.grid2}>
            {/* ICE */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="ice">
                ICE
              </label>
              {isView ? (
                <ViewValue>{form.ice || null}</ViewValue>
              ) : (
                <input
                  id="ice"
                  type="text"
                  className={styles.input}
                  value={form.ice || ""}
                  placeholder="15 chiffres"
                  onChange={(e) => handleChange("ice", e.target.value)}
                />
              )}
            </div>

            {/* Identifiant Fiscal */}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="identifiant_fiscal">
                Identifiant Fiscal
              </label>
              {isView ? (
                <ViewValue>{form.identifiant_fiscal || null}</ViewValue>
              ) : (
                <input
                  id="identifiant_fiscal"
                  type="text"
                  className={styles.input}
                  value={form.identifiant_fiscal || ""}
                  placeholder="IF…"
                  onChange={(e) =>
                    handleChange("identifiant_fiscal", e.target.value)
                  }
                />
              )}
            </div>
          </div>

          {/* Dates en mode view */}
          {isView && initialData && (
            <>
              <div className={styles.sectionTitle}>Informations</div>
              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <span className={styles.label}>Créé le</span>
                  <ViewValue>
                    {initialData.created_at
                      ? new Date(initialData.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : null}
                  </ViewValue>
                </div>
                <div className={styles.fieldGroup}>
                  <span className={styles.label}>Mis à jour le</span>
                  <ViewValue>
                    {initialData.updated_at
                      ? new Date(initialData.updated_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : null}
                  </ViewValue>
                </div>
              </div>
            </>
          )}
        </div>
        {/* /body */}

        {/* Footer */}
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
                  ? "Créer le client"
                  : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
