import { useState, useEffect } from "react";
import { useCompanies } from "../../hooks/useCompanies";
import PageHeader from "../../components/common/PageHeader";
import CompanyForm from "./components/CompanyForm/CompanyForm";
import styles from "./CompanyPage.module.css";

export default function CompanyPage() {
  const {
    createCompany,
    updateCompany,
    clearError,
    clearSuccess,
    fetchCompanies,
    companies,
    error,
    success,
  } = useCompanies();

  const [mode, setMode] = useState("view"); // view | edit
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const company = Array.isArray(companies) ? companies[0] : companies;

  useEffect(() => {
    const loadCompany = async () => {
      setLoading(true);
      try {
        await fetchCompanies();
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [fetchCompanies]);
  useEffect(() => {
    if (success) {
      notify(
        "success",
        mode === "edit" ? "Entreprise mise à jour avec succès." : "Entreprise créée avec succès."
      );
      clearSuccess();
      setMode("view");
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      notify("error", error?.message || "Une erreur est survenue.");
      clearError();
    }
  }, [error]);

  const notify = (type, message, duration = 3500) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  const handleEdit = () => {
    setMode("edit");
  };

  const handleCancel = () => {
    setMode("view");
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (mode === "edit" && company?.id) {
        await updateCompany(company.id, payload);
      } else {
        await createCompany(payload);
      }

      await fetchCompanies();
    } catch (err) {
      console.error("Form submission error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Mon entreprise"
        subtitle="Gérez les informations de votre entreprise."
        actions={
          <div className={styles.headerActions}>
            {!company && mode === "view" && (
              <button className={styles.editBtn} type="button" onClick={handleEdit}>
                Créer l'entreprise
              </button>
            )}
            {company && mode === "view" && (
              <button className={styles.editBtn} type="button" onClick={handleEdit}>
                Modifier
              </button>
            )}
            {mode === "edit" && (
              <button className={styles.cancelBtn} type="button" onClick={handleCancel}>
                Annuler
              </button>
            )}
          </div>
        }
      />

      {notification && (
        <div className={`${styles.toast} ${styles[`toast--${notification.type}`]}`}>
          <span className={styles.toastDot} />
          {notification.message}
        </div>
      )}

      <div className={styles.contentGrid}>
        <section className={styles.mainCard}>
          <CompanyForm
            mode={mode}
            initialData={company || null}
            loading={loading}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </section>
      </div>
    </div>
  );
}
