import styles from "./TaskStats.module.css";

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const AlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

export default function TaskStats({ stats = {} }) {
  const items = [
    { key: "total",       label: "Total",       value: stats.total       ?? 0, icon: <ListIcon />,         color: "accent"  },
    { key: "todo",        label: "À faire",     value: stats.todo        ?? 0, icon: <ClockIcon />,        color: "purple"  },
    { key: "in_progress", label: "En cours",    value: stats.in_progress ?? 0, icon: <PlayIcon />,         color: "cyan"    },
    { key: "completed",   label: "Terminées",   value: stats.completed   ?? 0, icon: <CheckCircleIcon />,  color: "green"   },
    { key: "urgent",      label: "Urgentes",    value: stats.urgent      ?? 0, icon: <ZapIcon />,          color: "amber"   },
    { key: "overdue",     label: "En retard",   value: stats.overdue     ?? 0, icon: <AlertTriangleIcon />,color: "red"     },
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