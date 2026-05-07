import styles from "./CategoryStats.module.css";

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const BoxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);

export default function CategoryStats({ stats = {}, categories = [] }) {
  const totalProducts = categories.reduce((acc, c) => acc + (c.products_count || 0), 0);

  const items = [
    { key: "total",    label: "Total",        value: stats.total    ?? 0, icon: <GridIcon />,  color: "accent" },
    { key: "actifs",   label: "Actives",      value: stats.actifs   ?? 0, icon: <CheckIcon />, color: "green"  },
    { key: "inactifs", label: "Inactives",    value: stats.inactifs ?? 0, icon: <XIcon />,     color: "red"    },
    { key: "products", label: "Produits liés",value: totalProducts,        icon: <BoxIcon />,   color: "cyan"   },
  ];

  return (
    <div className={styles.statsBar}>
      {items.map((item) => (
        <div key={item.key} className={`${styles.stat} ${styles[`stat--${item.color}`]}`}>
          <div className={styles.statIcon}>{item.icon}</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{item.value}</span>
            <span className={styles.statLabel}>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}