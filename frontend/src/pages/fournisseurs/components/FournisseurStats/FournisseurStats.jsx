import { useMemo } from "react";
import styles from "./FournisseurStats.module.css";

/* ── Icons ─────────────────────────────────────────────────────────────── */
const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function FournisseurStats({ globalstats}) {
  console.log("FournisseurStats rendered with globalstats:", globalstats);
  const stats = useMemo(() => {
    return [
      {
        key: "total",
        label: "Total",
        value: globalstats.total,
        icon: <UsersIcon />,
        color: "accent",
      },
      {
        key: "actifs",
        label: "Actifs",
        value: globalstats.actifs,
        icon: <CheckIcon />,
        color: "green",
      },
      {
        key: "inactifs",
        label: "Inactifs",
        value: globalstats.inactifs,
        icon: <XIcon />,
        color: "red",
      },
      {
        key: "villes",
        label: "Villes",
        value: globalstats.villes,
        icon: <MapPinIcon />,
        color: "cyan",
      },
    ];
  }, [globalstats]);

  return (
    <div className={styles.statsBar}>
      {stats.map((stat) => (
        <div key={stat.key} className={`${styles.stat} ${styles[`stat--${stat.color}`]}`}>
          <div className={styles.statIcon}>{stat.icon}</div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}