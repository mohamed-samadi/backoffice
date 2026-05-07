import styles from "./ProductStats.module.css";

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const TrendingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const WarehouseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

export default function ProductStats({ stats = {} }) {
  const items = [
    {
      key: "total",
      label: "Total produits",
      value: stats.total ?? 0,
      icon: <PackageIcon />,
      color: "accent",
    },
    {
      key: "actifs",
      label: "Actifs",
      value: stats.actifs ?? 0,
      icon: <CheckIcon />,
      color: "green",
    },
    {
      key: "stock_faible",
      label: "Stock faible",
      value: stats.stock_faible ?? 0,
      icon: <AlertIcon />,
      color: "red",
    },
    {
      key: "stock_total",
      label: "Stock total",
      value: (stats.stock_total ?? 0).toLocaleString("fr-FR"),
      icon: <WarehouseIcon />,
      color: "purple",
    },
    {
      key: "prix_moyen",
      label: "Prix moyen",
      value: stats.prix_moyen != null
        ? Number(stats.prix_moyen).toLocaleString("fr-FR", { style: "currency", currency: "MAD" })
        : "—",
      icon: <TagIcon />,
      color: "cyan",
    },
    {
      key: "inactifs",
      label: "Inactifs",
      value: stats.inactifs ?? 0,
      icon: <TrendingIcon />,
      color: "amber",
    },
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