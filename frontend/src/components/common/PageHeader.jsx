import { memo } from "react";
import styles from "./PageHeader.module.css";

/**
 * PageHeader Component
 * En-tête de page avec titre et actions
 */
const PageHeader = memo(({ title, subtitle, actions }) => {
  return (
    <div className={styles.header}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
});

PageHeader.displayName = "PageHeader";

export default PageHeader;
