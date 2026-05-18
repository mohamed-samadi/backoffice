import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../components/common/PageHeader";
import { fetchMe, updateProfile } from "../../features/auth/slice/authSlice";
import styles from "./UserProfilePage.module.css";

const getInitial = (user) =>
  (user?.name || user?.email || "U").trim().charAt(0).toUpperCase();

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function UserProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [dispatch, user]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      name: user?.name || "",
      email: user?.email || "",
    }));
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const accountAge = useMemo(() => formatDate(user?.created_at), [user?.created_at]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
    };
    if (form.password || form.password_confirmation) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }

    try {
      await dispatch(updateProfile(payload)).unwrap();
      setForm((previous) => ({
        ...previous,
        password: "",
        password_confirmation: "",
      }));
      setMessage({ type: "success", text: "Profil mis a jour avec succes." });
    } catch (error) {
      const text =
        typeof error === "string"
          ? error
          : error?.email?.[0] || error?.password?.[0] || "Erreur lors de la mise a jour.";
      setMessage({ type: "error", text });
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Profil utilisateur"
        subtitle="Consultez votre compte et mettez a jour vos informations de connexion."
      />

      {message && (
        <div className={`${styles.alert} ${styles[`alert--${message.type}`]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.grid}>
        <aside className={styles.profileCard}>
          <div className={styles.profileHero}>
            <div className={styles.avatar}>{getInitial(user)}</div>
            <div>
              <span className={styles.kicker}>Compte connecte</span>
              <h2>{user?.name || "Utilisateur"}</h2>
              <p>{user?.email || "-"}</p>
            </div>
          </div>

          <div className={styles.metaList}>
            <div>
              <span>ID utilisateur</span>
              <strong>{user?.id || "-"}</strong>
            </div>
            <div>
              <span>Compte cree le</span>
              <strong>{accountAge}</strong>
            </div>
          </div>
        </aside>

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <section className={styles.formSection}>
            <div className={styles.sectionHead}>
              <h3>Identite</h3>
              <p>Ces informations apparaissent dans votre session et votre espace de travail.</p>
            </div>

            <div className={styles.twoCols}>
              <label className={styles.field}>
                <span>Nom</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Nom utilisateur"
                />
              </label>

              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="email@exemple.com"
                />
              </label>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.sectionHead}>
              <h3>Securite</h3>
              <p>Laissez les champs vides pour conserver le mot de passe actuel.</p>
            </div>

            <div className={styles.twoCols}>
            <label className={styles.field}>
              <span>Nouveau mot de passe</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => handleChange("password", event.target.value)}
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
                placeholder="Minimum 8 caracteres"
              />
            </label>

            <label className={styles.field}>
              <span>Confirmation</span>
              <input
                type="password"
                value={form.password_confirmation}
                onChange={(event) => handleChange("password_confirmation", event.target.value)}
                minLength={8}
                disabled={isLoading}
                autoComplete="new-password"
                placeholder="Repeter le mot de passe"
              />
            </label>
            </div>
          </section>

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
