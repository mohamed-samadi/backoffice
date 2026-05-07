import { memo } from "react";
import styles from "./FilterPanel.module.css";

/**
 * FilterPanel Component
 * Panneau de filtrage réutilisable
 */
const FilterPanel = memo(
  ({ filters, onFilterChange, onReset, filterFields }) => {
    
    const handleChange = (key, value) => {
      // 1. On prépare le nouvel objet de filtres
      const newFilters = { ...filters, [key]: value };

      if (value === "" || value === null) {
        delete newFilters[key];
      }

      // 3. On envoie les nouveaux filtres au parent
      onFilterChange(newFilters);
    };
    return (
      <div className={styles.filterPanel}>
        <div className={styles.filterContent}>
          {filterFields.map((field) => (
            <div key={field.key} className={styles.filterGroup}>
              <label htmlFor={field.key}>{field.label}</label>
              {field.type === "text" && (
                <input
                  id={field.key}
                  type="text"
                  placeholder={field.placeholder}
                  value={filters[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={styles.input}
                />
              )}
              {field.type === "select" && (
                <select
                  id={field.key}
                  value={filters[field.key] || ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={styles.select}
                >
                  <option value="">Tous</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
              {field.type === "number" && (
                <input
                  id={field.key}
                  type="number"
                  placeholder={field.placeholder}
                  value={filters[field.key] || ""}
                  onChange={(e) =>
                    handleChange(field.key, parseFloat(e.target.value) || "")
                  }
                  className={styles.input}
                />
              )}
            </div>
          ))}
        </div>
        <button onClick={onReset} className={styles.resetBtn}>
          Réinitialiser
        </button>
      </div>
    );
  },
);

FilterPanel.displayName = "FilterPanel";

export default FilterPanel;
