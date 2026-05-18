import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, clearError } from "../../features/auth/slice/authSlice";
import styles from "./LoginPage.module.css";

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((s) => s.auth);

  const [form,        setForm]        = useState({ email: "", password: "" });
  const [showPass,    setShowPass]    = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // ✅ Si déjà connecté → rediriger
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // ✅ Nettoyer l'erreur en quittant la page
  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const validate = () => {
    const errs = {};
    if (!form.email)                                        errs.email    = "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   errs.email    = "Email invalide";
    if (!form.password)                                     errs.password = "Le mot de passe est requis";
    if (form.password.length < 8)                          errs.password = "Minimum 8 caractères";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    dispatch(login(form));
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Logo / Titre */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <LockIcon />
          </div>
          <h1 className={styles.title}>Backoffice</h1>
          <p className={styles.subtitle}>Connectez-vous pour accéder au panneau d'administration</p>
        </div>

        {/* Erreur API */}
        {error && (
          <div className={styles.errorBanner}>
            <span className={styles.errorDot} />
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Email */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
              value={form.email}
              placeholder="admin@exemple.com"
              onChange={(e) => {
                setForm((p) => ({ ...p, email: e.target.value }));
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: null }));
              }}
              disabled={isLoading}
            />
            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">Mot de passe</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                className={`${styles.input} ${styles.inputPassword} ${fieldErrors.password ? styles.inputError : ""}`}
                value={form.password}
                placeholder="••••••••"
                onChange={(e) => {
                  setForm((p) => ({ ...p, password: e.target.value }));
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: null }));
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((s) => !s)}
                tabIndex={-1}
              >
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading
              ? <><span className={styles.spinner} /> Connexion…</>
              : "Se connecter"}
          </button>

        </form>

        <p className={styles.footer}>
          Accès réservé à l'administrateur
        </p>
      </div>
    </div>
  );
}