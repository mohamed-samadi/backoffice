import styles from "./ChequeStats.module.css";

const TotalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const XCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

export default function ChequeStats({ stats = {} }) {
  const items = [
    { key: "total",           label: "Total",           value: stats.total           ?? 0, icon: <TotalIcon />, color: "accent"  },
    { key: "non_encaisse",    label: "Non encaissés",   value: stats.non_encaisse    ?? 0, icon: <ClockIcon />, color: "purple"  },
    { key: "encaisse",        label: "Encaissés",       value: stats.encaisse        ?? 0, icon: <CheckIcon />, color: "green"   },
    { key: "impaye",          label: "Impayés",         value: stats.impaye          ?? 0, icon: <AlertIcon />, color: "red"     },
    { key: "annule",          label: "Annulés",         value: stats.annule          ?? 0, icon: <XCircleIcon/>,color: "amber"   },
    { key: "echeance_proche", label: "Échéance proche", value: stats.echeance_proche ?? 0, icon: <BellIcon />,  color: "cyan"    },
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