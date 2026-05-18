import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./CompanyForm.module.css";
import { getApiUrl } from "../../../../api/config";

const createEmptyForm = () => ({
  nom: "",
  nom_commercial: "",
  identifiant_fiscal: "",
  adresse: "",
  ville: "",
  code_postal: "",
  pays: "",
  telephone: "",
  email: "",
  ice: "",
  registre_commerce: "",
  bank: "",
  iban: "",
  logo_path: "",
});

const normalizeForm = (data) => ({
  nom: data?.nom ?? "",
  nom_commercial: data?.nom_commercial ?? "",
  identifiant_fiscal: data?.identifiant_fiscal ?? "",
  adresse: data?.adresse ?? "",
  ville: data?.ville ?? "",
  code_postal: data?.code_postal ?? "",
  pays: data?.pays ?? "",
  telephone: data?.telephone ?? "",
  email: data?.email ?? "",
  ice: data?.ice ?? "",
  registre_commerce: data?.registre_commerce ?? "",
  bank: data?.bank ?? "",
  iban: data?.iban ?? "",
  logo_path: data?.logo_path ?? "",
});

// ─── Validators ────────────────────────────────────────────────────────────
const VALIDATORS = {
  nom: (v) => {
    if (!v?.trim()) return "Le nom est requis";
    if (v.trim().length < 2) return "Minimum 2 caractères";
    return null;
  },
  email: (v) => {
    if (!v?.trim()) return "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Format email invalide";
    return null;
  },
  telephone: (v) => {
    if (!v?.trim()) return null;
    if (!/^(\+?[\d\s\-().]{8,15})$/.test(v.trim()))
      return "Format invalide (ex: +212 6xx xxx xxx)";
    return null;
  },
  code_postal: (v) => {
    if (!v?.trim()) return null;
    if (!/^\d{4,6}$/.test(v.trim())) return "4 à 6 chiffres uniquement";
    return null;
  },
  ice: (v) => {
    if (!v?.trim()) return null;
    if (!/^\d{15}$/.test(v.trim())) return "L'ICE doit contenir exactement 15 chiffres";
    return null;
  },
  registre_commerce: (v) => {
    if (!v?.trim()) return null;
    if (v.trim().length < 2) return "Numéro RC trop court";
    return null;
  },
  identifiant_fiscal: (v) => {
    if (!v?.trim()) return null;
    if (!/^\d+$/.test(v.trim())) return "Chiffres uniquement";
    return null;
  },
};

function validateAll(form) {
  const errors = {};
  for (const [field, fn] of Object.entries(VALIDATORS)) {
    const msg = fn(form[field]);
    if (msg) errors[field] = msg;
  }
  return errors;
}

function resolveLogoPathToUrl(logoPath) {
  if (!logoPath) return null;
  if (/^https?:\/\//i.test(logoPath)) return logoPath;
  if (logoPath.startsWith("/storage")) return `${getApiUrl()}${logoPath}`;
  return `${getApiUrl()}/storage/${logoPath}`;
}

// ─── Field wrapper ─────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </span>
      {children}
      {error && <span className={styles.errorMsg}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

// ─── Controlled input ──────────────────────────────────────────────────────
function TextInput({ value, onChange, onBlur, error, onlyDigits, maxLength, disabled, placeholder, type = "text" }) {
  const handleChange = (e) => {
    let val = e.target.value;
    if (onlyDigits) val = val.replace(/\D/g, "");
    if (maxLength !== undefined) val = val.slice(0, maxLength);
    onChange(val);
  };
  return (
    <input
      className={`${styles.input} ${error ? styles.inputError : ""}`}
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}

// ─── Section card ──────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHead}>
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

// ─── View row ──────────────────────────────────────────────────────────────
function ViewRow({ label, value, href }) {
  return (
    <div className={styles.viewRow}>
      <span className={styles.viewLabel}>{label}</span>
      <span className={styles.viewValue}>
        {value ? (
          href ? <a href={href} className={styles.link}>{value}</a> : value
        ) : (
          <span className={styles.viewEmpty}>—</span>
        )}
      </span>
    </div>
  );
}

function ViewSection({ title, children }) {
  return (
    <div className={styles.viewSection}>
      <div className={styles.viewSectionHead}>
        <h3>{title}</h3>
      </div>
      <div className={styles.viewGrid}>{children}</div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ onConfigure }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIllus} aria-hidden="true">🏢</div>
      <h3 className={styles.emptyTitle}>Aucune entreprise configurée</h3>
      <p className={styles.emptyDesc}>
        Ajoutez les informations de votre entreprise pour les retrouver
        automatiquement sur vos factures, devis et autres documents.
      </p>
      {onConfigure && (
        <button className={styles.primaryBtn} onClick={onConfigure} type="button">
          Configurer l'entreprise
        </button>
      )}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────
export default function CompanyForm({
  mode = "view",
  initialData = null,
  loading = false,
  saving = false,
  onSubmit,
  onCancel,
  onConfigure,
}) {
  const isView = mode === "view";

  const [form, setForm] = useState(createEmptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialData) {
      setForm(normalizeForm(initialData));
      setLogoPreview(resolveLogoPathToUrl(initialData.logo_path) || null);
    } else {
      setForm(createEmptyForm());
      setLogoPreview(null);
    }
    setErrors({});
    setTouched({});
    setLogoFile(null);
  }, [initialData, mode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const msg = VALIDATORS[field]?.(value) ?? null;
      setErrors((prev) => ({ ...prev, [field]: msg }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const msg = VALIDATORS[field]?.(form[field]) ?? null;
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleLogoChange = (file) => {
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      handleChange("logo_path", "");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logo: "Fichier trop volumineux (max 5 Mo)" }));
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);
    setErrors((prev) => ({ ...prev, logo: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {}));
    const nextErrors = validateAll(form);

    if (logoFile && logoFile.size > 5 * 1024 * 1024) {
      nextErrors.logo = "Fichier trop volumineux (max 5 Mo)";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    let payload;
    if (logoFile) {
      payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "logo_path") return;

        const value = v?.trim?.() ?? "";
        if (value !== "") {
          payload.append(k, value);
        }
      });
      payload.append("logo", logoFile);
    } else {
      payload = Object.fromEntries(
        Object.entries(form)
          .map(([k, v]) => [k, v?.trim?.() ?? ""])
          .filter(([, value]) => value !== "")
      );
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // Loading
  if (loading && !initialData) {
    return (
      <div className={styles.loadingState}>
        <span className={styles.spinner} aria-hidden="true" />
        Chargement des paramètres…
      </div>
    );
  }

  // View — no data
  if (isView && !initialData) {
    return <EmptyState onConfigure={onConfigure} />;
  }

  // View — with data
  if (isView && initialData) {
    return (
      <div className={styles.viewer}>
        <ViewSection  title="Informations générales">
          <ViewRow label="Nom" value={initialData.nom} />
          <ViewRow label="Nom commercial" value={initialData.nom_commercial} />
          <ViewRow label="ICE" value={initialData.ice} />
          <ViewRow label="Registre commerce" value={initialData.registre_commerce} />
          <ViewRow label="Identifiant fiscal" value={initialData.identifiant_fiscal} />
          <ViewRow label="Téléphone" value={initialData.telephone} href={initialData.telephone ? `tel:${initialData.telephone}` : null} />
          <ViewRow label="Email" value={initialData.email} href={initialData.email ? `mailto:${initialData.email}` : null} />
        </ViewSection>

        <ViewSection  title="Coordonnées">
          <ViewRow label="Adresse" value={initialData.adresse} />
          <ViewRow label="Ville" value={initialData.ville} />
          <ViewRow label="Code postal" value={initialData.code_postal} />
          <ViewRow label="Pays" value={initialData.pays} />
        </ViewSection>

        <ViewSection title="Banque">
          <ViewRow label="Banque" value={initialData.bank} />
          <ViewRow label="IBAN" value={initialData.iban} />
        </ViewSection>

        <ViewSection  title="Branding">
          <div className={`${styles.viewRow} ${styles.viewRowFull}`}>
            <span className={styles.viewLabel}>Logo</span>
            <span className={styles.viewValue}>
              {initialData.logo_path ? (
                <div className={styles.logoViewer}>
                  <img
                    src={resolveLogoPathToUrl(initialData.logo_path)}
                    alt="Logo de l'entreprise"
                    className={styles.logoPreviewImg}
                  />
                  <a href={resolveLogoPathToUrl(initialData.logo_path)} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    Voir le logo
                  </a>
                </div>
              ) : <span className={styles.viewEmpty}>—</span>}
            </span>
          </div>
        </ViewSection>
      </div>
    );
  }

  // Edit form
  const fieldProps = (field) => ({
    value: form[field],
    onChange: (v) => handleChange(field, v),
    onBlur: () => handleBlur(field),
    error: errors[field],
    disabled: saving,
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>

        <SectionCard title="Informations générales">
          <div className={styles.fieldsGrid}>
            <Field label="Nom" required error={errors.nom}>
              <TextInput {...fieldProps("nom")} placeholder="App groupe" />
            </Field>
            <Field label="Nom commercial" error={errors.nom_commercial}>
              <TextInput {...fieldProps("nom_commercial")} placeholder="Nom commercial" />
            </Field>
            <Field label="ICE" error={errors.ice} hint="15 chiffres">
              <TextInput {...fieldProps("ice")} placeholder="000000000000000" onlyDigits maxLength={15} />
            </Field>
            <Field label="Registre commerce" error={errors.registre_commerce}>
              <TextInput {...fieldProps("registre_commerce")} placeholder="Ex : 12345" />
            </Field>
            <Field label="Identifiant fiscal" error={errors.identifiant_fiscal} hint="Chiffres uniquement">
              <TextInput {...fieldProps("identifiant_fiscal")} placeholder="Ex : 12345678" onlyDigits />
            </Field>
            <Field label="Téléphone" error={errors.telephone}>
              <TextInput {...fieldProps("telephone")} placeholder="+212 6xx xxx xxx" type="tel" />
            </Field>
            <Field label="Email" required error={errors.email}>
              <TextInput {...fieldProps("email")} placeholder="contact@entreprise.ma" type="email" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard  title="Coordonnées">
          <div className={styles.fieldsGrid}>
            <Field label="Adresse" error={errors.adresse}>
              <TextInput {...fieldProps("adresse")} placeholder="Rue, Numéro" />
            </Field>
            <Field label="Ville" error={errors.ville}>
              <TextInput {...fieldProps("ville")} placeholder="Tanger" />
            </Field>
            <Field label="Code postal" error={errors.code_postal} hint="4 à 6 chiffres">
              <TextInput {...fieldProps("code_postal")} placeholder="90000" onlyDigits maxLength={6} />
            </Field>
            <Field label="Pays" error={errors.pays}>
              <TextInput {...fieldProps("pays")} placeholder="Maroc" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Banque">
          <div className={styles.fieldsGrid}>
            <Field label="Banque" error={errors.bank}>
              <TextInput {...fieldProps("bank")} placeholder="Ex : Attijariwafa Bank" />
            </Field>
            <Field label="IBAN" error={errors.iban}>
              <TextInput {...fieldProps("iban")} placeholder="MA64 ..." />
            </Field>
          </div>
        </SectionCard>

        <SectionCard  title="Branding">
          <div className={styles.fieldsGrid}>
            <Field label="Logo" error={errors.logo} hint="PNG, JPG, SVG — max 5 Mo">
              <input
                className={`${styles.input} ${styles.fileInput} ${errors.logo ? styles.inputError : ""}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
                disabled={saving}
              />
              {logoPreview && (
                <div className={styles.logoPreview}>
                  <img src={logoPreview} alt="Aperçu du logo" />
                  <button type="button" className={styles.removeBtn} onClick={() => handleLogoChange(null)} disabled={saving}>
                    Supprimer
                  </button>
                </div>
              )}
            </Field>
          </div>
        </SectionCard>

      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryBtn} onClick={onCancel} disabled={saving}>
          Annuler
        </button>
        <button type="submit" className={styles.primaryBtn} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

CompanyForm.propTypes = {
  mode: PropTypes.oneOf(["view", "edit"]),
  initialData: PropTypes.object,
  loading: PropTypes.bool,
  saving: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onConfigure: PropTypes.func,
};
