import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import styles from "./Topbar.module.css";

const PAGE_TITLES = {
  "/home": "Tableau de Bord",
  "/clients": "Clients",
  "/appointments": "Rendez-vous",
  "/cheques": "Chèques",
  "/supplier-credit": "Crédits Fournisseurs",
  "/client-credit": "Crédits Clients",
  "/content": "Contenu",
  "/whatsapp": "WhatsApp",
  "/files": "Fichiers",
  "/devis": "Devis",
  "/factures": "Factures",
  "/bon-livraison": "Bon Livraison",
  "/tasks": "Tâches",
  "/expenses": "Dépenses",
  "/pipeline": "Pipeline",
  "/catalog": "Catalogue",
  "/analytics": "Analyse",
  "/client360": "Vue Client 360°",
  "/cashflow": "Trésorerie",
};

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nonLuesCount, fetchNotificationsCount } = useNotifications();
  const title = PAGE_TITLES[location.pathname] || "Dashboard";

  useEffect(() => {
    fetchNotificationsCount().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.topbar}>
      <div className={styles.title}>{title}</div>
      <div className={styles.actions}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search…"
          />
        </div>
        <button
          className={`${styles.iconButton} ${styles.notificationButton}`}
          title="Notifications"
          onClick={() => navigate("/notifications")}
        >
          🔔
          {nonLuesCount > 0 && (
            <span className={styles.notificationBadge}>
              {nonLuesCount > 99 ? "99+" : nonLuesCount}
            </span>
          )}
        </button>
        <button
          className={`${styles.iconButton} ${styles.userButton}`}
          title="Profil utilisateur"
        >
          E
        </button>
      </div>
    </div>
  );
};

export default Topbar;
