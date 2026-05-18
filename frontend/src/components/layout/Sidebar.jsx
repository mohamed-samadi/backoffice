import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import styles from "./Sidebar.module.css";
import {
  FaChartLine,
  FaUsers,
  FaTruck,
  FaBox,
  FaTags,
  FaCog,
  FaFileAlt,
  FaCreditCard,
  FaBuilding,
  FaSignOutAlt,
} from "react-icons/fa";
import { logout } from "../../features/auth/slice/authSlice";

const NAV_ITEMS = [
  { label: "Tableau de bord", path: "/home", icon: FaChartLine },
  { label: "", separator: true },

  // --- Partie CRM ---
  { label: "CRM", category: true },
  { label: "Clients", path: "/clients", icon: FaUsers },
  { label: "Fournisseurs", path: "/fournisseurs", icon: FaTruck },

  { label: "", separator: true },
  { label: "Tâches", path: "/tasks", icon: FaFileAlt },
  { label: "Catégories de tâches", path: "/task-categories", icon: FaTags },
  { label: "Gestion Stock", category: true },
  { label: "products", path: "/products", icon: FaBox },
  { label: "Catégories", path: "/categories", icon: FaTags },
  { label: "", separator: true },
  { label: "Finance", category: true },
  { label: "Documents", path: "/documents", icon: FaFileAlt },
  { label: "Paiements", path: "/payments", icon: FaCreditCard },

  { label: "Chèques", path: "/cheques", icon: FaCreditCard },
  { label: "Crédits", path: "/credits", icon: FaCreditCard },
  { label: "", separator: true },

  { label: "notifications", path: "/notifications", icon: FaTags },

  { label: "Configuration", category: true },
  { label: "Mon entreprise", path: "/companies", icon: FaBuilding },

  { label: "Paramètres", path: "/settings", icon: FaCog },
];
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch {
      // Même si l'API échoue, on force la déconnexion locale + redirection
    }
    navigate("/login", { replace: true });
  };

  return (
    <div className={`${styles.sidebar} ${!isOpen ? styles.collapsed : ""}`}>
      <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.logo}>B</div>
        {isOpen && (
          <div className={styles.logoText}>
            <div className={styles.logoTitle}>BizOS</div>
            <div className={styles.logoSubtitle}>v2 · ERP</div>
          </div>
        )}
      </div>
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item, idx) => {
          if (item.separator) {
            return isOpen ? (
              <div key={idx} className={styles.separator} />
            ) : null;
          }

          if (item.category) {
            return isOpen ? (
              <div key={idx} className={styles.category}>
                {item.label}
              </div>
            ) : null;
          }

          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          return (
            <Link
              key={idx}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.navIcon}>
                {IconComponent && <IconComponent size={20} />}
              </span>
              {isOpen && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottomActions}>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
          title="Déconnexion"
        >
          <span className={styles.navIcon}>
            <FaSignOutAlt size={20} />
          </span>
          {isOpen && <span className={styles.navLabel}>Déconnexion</span>}
        </button>
      </div>

      {/* Footer */}
      {isOpen && (
        <div className={styles.footer}>
          <div className={styles.footerTitle}>Mon Entreprise</div>
          <div className={styles.footerSub}>Entrepreneur · Tanger</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
