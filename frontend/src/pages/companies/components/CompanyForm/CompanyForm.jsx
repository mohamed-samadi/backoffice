import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./CompanyForm.module.css";

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
  logo_path: data?.logo_path ?? "",

});

export default function CompanyForm({
  mode = "view",
  initialData = null,
  loading = false,
  saving = false,
  onSubmit,
  onCancel,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [form, setForm] = useState(createEmptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm(normalizeForm(initialData));
    } else {
      setForm(createEmptyForm());
    }
    setErrors({});
  }, [initialData, mode]);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.nom?.trim()) nextErrors.nom = "Le nom est requis";
    if (!form.email?.trim()) nextErrors.email = "L'email est requis";
    if (form.email && !form.email.includes("@")) nextErrors.email = "L'email est invalide";

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      nom: form.nom.trim(),
      nom_commercial: form.nom_commercial?.trim() || null,
      identifiant_fiscal: form.identifiant_fiscal?.trim() || null,
      adresse: form.adresse?.trim() || null,
      ville: form.ville?.trim() || null,
      code_postal: form.code_postal?.trim() || null,
      pays: form.pays?.trim() || null,
      telephone: form.telephone?.trim() || null,
      email: form.email.trim(),
      ice: form.ice?.trim() || null,
      registre_commerce: form.registre_commerce?.trim() || null,
      logo_path: form.logo_path?.trim() || null,
    
      
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  if (loading && !initialData) {
    return <div className={styles.loadingState}>Chargement des paramètres…</div>;
  }

  if (isView && !initialData) {
    return <div className={styles.emptyState}>Aucune entreprise configurée.</div>;
  }

  if (isView && initialData) {
    return (
      <div className={styles.viewer}>
        <div className={styles.section}>
          <h3>Informations générales</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nom</span>
              <span className={styles.infoValue}>{initialData.nom || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nom commercial</span>
              <span className={styles.infoValue}>{initialData.nom_commercial || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>ICE</span>
              <span className={styles.infoValue}>{initialData.ice || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Registre commerce</span>
              <span className={styles.infoValue}>{initialData.registre_commerce || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Identifiant fiscal (IF)</span>
              <span className={styles.infoValue}>{initialData.identifiant_fiscal || "—"}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Coordonnées</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Adresse</span>
              <span className={styles.infoValue}>{initialData.adresse || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ville</span>
              <span className={styles.infoValue}>{initialData.ville || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Code postal</span>
              <span className={styles.infoValue}>{initialData.code_postal || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Pays</span>
              <span className={styles.infoValue}>{initialData.pays || "—"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Téléphone</span>
              <span className={styles.infoValue}>
                {initialData.telephone ? (
                  <a href={`tel:${initialData.telephone}`} className={styles.link}>
                    {initialData.telephone}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>
                {initialData.email ? (
                  <a href={`mailto:${initialData.email}`} className={styles.link}>
                    {initialData.email}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Branding</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Logo</span>
              <span className={styles.infoValue}>
                {initialData.logo_path ? (
                  <a href={initialData.logo_path} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    Voir le logo
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHead}>
            <h3>Informations générales</h3>
          </div>

          <div className={styles.fieldsGrid}>
            <label className={styles.field}>
              <span className={styles.label}>
                Nom <span className={styles.required}>*</span>
              </span>
              <input
                className={styles.input}
                type="text"
                value={form.nom}
                onChange={(e) => handleFieldChange("nom", e.target.value)}
                disabled={saving}
                placeholder="Nom de l'entreprise"
              />
              {errors.nom && <span className={styles.error}>{errors.nom}</span>}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Nom commercial</span>
              <input
                className={styles.input}
                type="text"
                value={form.nom_commercial}
                onChange={(e) => handleFieldChange("nom_commercial", e.target.value)}
                disabled={saving}
                placeholder="Nom commercial"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>ICE</span>
              <input
                className={styles.input}
                type="text"
                value={form.ice}
                onChange={(e) => handleFieldChange("ice", e.target.value)}
                disabled={saving}
                placeholder="Identifiant commun de l'entreprise"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Registre commerce</span>
              <input
                className={styles.input}
                type="text"
                value={form.registre_commerce}
                onChange={(e) => handleFieldChange("registre_commerce", e.target.value)}
                disabled={saving}
                placeholder="Registre commerce"
              />
            </label>
    

            <label className={styles.field}>
              <span className={styles.label}>identifiant fiscal</span>
              <input
                className={styles.input}
                type="text"
                value={form.identifiant_fiscal}
                onChange={(e) => handleFieldChange("identifiant_fiscal", e.target.value)}
                disabled={saving}
                placeholder="identifiant fiscal"
              />
            </label>

                        <label className={styles.field}>
              <span className={styles.label}>
                Téléphone <span className={styles.required}>*</span>
              </span>
              <input
                className={styles.input}
                type="tel"
                value={form.telephone}
                onChange={(e) => handleFieldChange("telephone", e.target.value)}
                disabled={saving}
                placeholder="Téléphone"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                Email <span className={styles.required}>*</span>
              </span>
              <input
                className={styles.input}
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                disabled={saving}
                placeholder="Email"
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </label>
          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHead}>
            <h3>Coordonnées</h3>
          </div>

          <div className={styles.fieldsGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Adresse</span>
              <input
                className={styles.input}
                type="text"
                value={form.adresse}
                onChange={(e) => handleFieldChange("adresse", e.target.value)}
                disabled={saving}
                placeholder="Adresse"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Ville</span>
              <input
                className={styles.input}
                type="text"
                value={form.ville}
                onChange={(e) => handleFieldChange("ville", e.target.value)}
                disabled={saving}
                placeholder="Ville"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Code postal</span>
              <input
                className={styles.input}
                type="text"
                value={form.code_postal}
                onChange={(e) => handleFieldChange("code_postal", e.target.value)}
                disabled={saving}
                placeholder="Code postal"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Pays</span>
              <input
                className={styles.input}
                type="text"
                value={form.pays}
                onChange={(e) => handleFieldChange("pays", e.target.value)}
                disabled={saving}
                placeholder="Pays"
              />
            </label>


          </div>
        </section>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHead}>
            <h3>Branding</h3>
          </div>

          <div className={styles.fieldsGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Logo (URL)</span>
              <input
                className={styles.input}
                type="text"
                value={form.logo_path}
                onChange={(e) => handleFieldChange("logo_path", e.target.value)}
                disabled={saving}
                placeholder="URL du logo (ex: https://...)"
              />
            </label>
          </div>
        </section>


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
};
