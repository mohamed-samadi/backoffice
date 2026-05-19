import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, register } from "../../features/auth/slice/authSlice";
import styles from "../login/LoginPage.module.css";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const validate = () => {
    const errors = {};

    if (!form.name.trim()) errors.name = "Le nom est requis";
    if (!form.email.trim()) errors.email = "L'email est requis";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Email invalide";
    }
    if (!form.password) errors.password = "Le mot de passe est requis";
    if (form.password && form.password.length < 8) {
      errors.password = "Minimum 8 caracteres";
    }
    if (form.password_confirmation !== form.password) {
      errors.password_confirmation = "Les mots de passe ne correspondent pas";
    }

    return errors;
  };

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((previous) => ({ ...previous, [field]: null }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    dispatch(register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      password_confirmation: form.password_confirmation,
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>B</div>
          <h1 className={styles.title}>Creer un compte</h1>
          <p className={styles.subtitle}>
            Ajoutez un utilisateur pour acceder au backoffice.
          </p>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <span className={styles.errorDot} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name">Nom complet</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className={`${styles.input} ${fieldErrors.name ? styles.inputError : ""}`}
              value={form.name}
              placeholder="Mohamed Reda"
              onChange={(event) => handleChange("name", event.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
              value={form.email}
              placeholder="admin@exemple.com"
              onChange={(event) => handleChange("email", event.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ""}`}
              value={form.password}
              placeholder="Minimum 8 caracteres"
              onChange={(event) => handleChange("password", event.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password_confirmation">
              Confirmer le mot de passe
            </label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              className={`${styles.input} ${fieldErrors.password_confirmation ? styles.inputError : ""}`}
              value={form.password_confirmation}
              placeholder="Repeter le mot de passe"
              onChange={(event) => handleChange("password_confirmation", event.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.password_confirmation && (
              <span className={styles.fieldError}>{fieldErrors.password_confirmation}</span>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <><span className={styles.spinner} /> Creation...</> : "Creer le compte"}
          </button>
        </form>

        <p className={styles.footer}>
          Deja un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
