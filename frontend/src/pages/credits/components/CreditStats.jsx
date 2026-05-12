import styles from "./CreditStats.mxodule.css";
const CreditCardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const AlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const TrendingDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

const fmt = (val) =>
  Number(val || 0).toLocaleString("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 });

export default function CreditStats({ stats = {} }) {
  const items = [
    {
      key:   "total",
      label: "Total crédits",
      value: stats.total_credits ?? 0,
      sub:   fmt(stats.montant_total),
      subLabel: "engagé",
      icon:  <CreditCardIcon />,
      color: "accent",
    },
    {
      key:   "en_cours",
      label: "En cours",
      value: stats.en_cours ?? 0,
      sub:   fmt(stats.total_reste),
      subLabel: "restant",
      icon:  <ClockIcon />,
      color: "purple",
    },
    {
      key:   "payes",
      label: "Soldés",
      value: stats.payes ?? 0,
      sub:   fmt(stats.montant_paye),
      subLabel: "encaissé",
      icon:  <CheckCircleIcon />,
      color: "green",
    },
    {
      key:   "en_retard",
      label: "En retard",
      value: stats.en_retard ?? 0,
      sub:   null,
      icon:  <AlertTriangleIcon />,
      color: "red",
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
            {item.sub && (
              <span className={styles.statSub}>
                {item.sub} <span className={styles.statSubLabel}>{item.subLabel}</span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}