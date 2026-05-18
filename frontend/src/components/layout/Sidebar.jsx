import { useEffect, useState } from "react";
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
import { getApiUrl } from "../../api/config";

const resolveLogoPathToUrl = (logoPath) => {
  if (!logoPath) return null;
  if (/^https?:\/\//i.test(logoPath)) return logoPath;
  if (logoPath.startsWith("/storage")) return `${getApiUrl()}${logoPath}`;
  return `${getApiUrl()}/storage/${logoPath}`;
};

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
  const [company, setCompany] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const loadCompany = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/companies`, {
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) return;

        const result = await response.json();
        if (!active) return;

        setCompany(result?.data ?? null);
      } catch {
        if (active) {
          setCompany(null);
        }
      }
    };

    loadCompany();

    return () => {
      active = false;
    };
  }, []);

  const companyLogoUrl = resolveLogoPathToUrl(company?.logo_path);

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
        <div className={styles.logo}>
          {companyLogoUrl ? (
            <img src={companyLogoUrl} alt={company?.nom || "Logo de l'entreprise"} className={styles.logoImage} />
          ) : (
            <span>B</span>
          )}
        </div>
        {isOpen && (
          <div className={styles.logoText}>
            <div className={styles.logoTitle}>{company?.nom || "Mon Entreprise"}</div>
            <div className={styles.logoSubtitle}>{company?.email || "Entrepreneur · Tanger"}</div>
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
          <div className={styles.footerTitle}>{company?.nom || "Mon Entreprise"}</div>
          <div className={styles.footerSub}>{company?.ville || company?.pays || "Entreprise"}</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
