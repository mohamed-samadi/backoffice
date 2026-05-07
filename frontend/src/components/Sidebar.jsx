/* ─────────────────────────────────────────────────────────────────────────────
   SIDEBAR COMPONENT — React
   
   Utilise exclusivement les variables CSS du fichier tokens.css
   Thème : Dark Premium
   
   Liens :
   - Inventory (Produits, Catégories)
   - Contacts (Fournisseurs)
   
   Inclus : Navigation, status badges, hover effects
   ───────────────────────────────────────────────────────────────────────────── */

import  { useState } from "react";
import styles from "./Sidebar.module.css";

/**
 * Sidebar Component
 *
 * Props:
 *   - activeItem: (string) ID de l'élément actif
 *   - onNavigate: (function) Callback lors du clic sur un item
 *   - collapsed: (boolean) État replié/expansé
 *   - onToggle: (function) Callback pour basculer le mode replié
 */
const Sidebar = ({
  activeItem = "inventory",
  onNavigate,
  collapsed = false,
  onToggle,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    inventory: true,
    contacts: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNavigation = (itemId) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  const navItems = [
    {
      section: "inventory",
      label: "📦 Inventory",
      icon: "◳",
      items: [
        { id: "products", label: "Produits", icon: "◉", badge: null },
        { id: "categories", label: "Catégories", icon: "◈", badge: null },
      ],
    },
    {
      section: "contacts",
      label: "👥 Contacts",
      icon: "◎",
      items: [
        { id: "suppliers", label: "Fournisseurs", icon: "◬", badge: null },
      ],
    },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          {!collapsed && <span className={styles.logoText}>BackOffice</span>}
        </div>
        {!collapsed && (
          <button
            className={styles.toggleBtn}
            onClick={onToggle}
            aria-label="Replier la sidebar"
            title="Replier"
          >
            ◀
          </button>
        )}
        {collapsed && (
          <button
            className={styles.toggleBtn}
            onClick={onToggle}
            aria-label="Déplier la sidebar"
            title="Déplier"
          >
            ▶
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((section) => (
          <div key={section.section} className={styles.section}>
            {/* Section Title */}
            <button
              className={styles.sectionTitle}
              onClick={() => toggleSection(section.section)}
              title={collapsed ? section.label : undefined}
            >
              <span className={styles.sectionIcon}>{section.icon}</span>
              {!collapsed && (
                <>
                  <span className={styles.sectionLabel}>{section.label}</span>
                  <span
                    className={`${styles.chevron} ${expandedSections[section.section] ? styles.expanded : ""}`}
                  >
                    ▼
                  </span>
                </>
              )}
            </button>

            {/* Section Items */}
            {!collapsed && expandedSections[section.section] && (
              <div className={styles.items}>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.item} ${activeItem === item.id ? styles.active : ""}`}
                    onClick={() => handleNavigation(item.id)}
                    title={item.label}
                  >
                    <span className={styles.itemIcon}>{item.icon}</span>
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.badge && (
                      <span className={styles.badge}>{item.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Collapsed View - Vertical Icon Stack */}
            {collapsed && expandedSections[section.section] && (
              <div className={styles.collapsedItems}>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.collapsedItem} ${activeItem === item.id ? styles.active : ""}`}
                    onClick={() => handleNavigation(item.id)}
                    title={item.label}
                  >
                    <span className={styles.itemIcon}>{item.icon}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className={styles.footer}>
          <button className={styles.helpBtn} title="Aide & Documentation">
            ❓
          </button>
          <span className={styles.version}>v1.0.0</span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
