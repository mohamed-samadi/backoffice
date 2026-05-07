import { memo } from "react";
import styles from "./DataTable.module.css";

/**
 * DataTable Component
 * Tableau avec pagination, tri et actions
 */
const DataTable = memo(
  ({ columns, data, loading, onRowClick, actions, pagination }) => {
    if (loading) {
      return <div className={styles.loadingContainer}>Chargement...</div>;
    }

    if (!data || data.length === 0) {
      return <div className={styles.emptyState}>Aucune donnée disponible</div>;
    }

    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} onClick={() => onRowClick?.(row)}>
                {columns.map((col) => (
                  <td key={`${row.id}-${col.key}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className={styles.actionsCell}>
                    <div className={styles.actionButtons}>
                      {actions.map((action) => (
                        <button
                          key={action.key}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(row);
                          }}
                          className={`${styles.actionBtn} ${styles[`action${action.key}`]}`}
                          title={action.label}
                        >
                          {action.icon || action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {pagination && (
          <div className={styles.pagination}>
            <button disabled={!pagination.hasPrev} onClick={pagination.onPrev}>
              Précédent
            </button>
            <span>
              Page {pagination.currentPage} sur {pagination.totalPages}
            </span>
            <button disabled={!pagination.hasNext} onClick={pagination.onNext}>
              Suivant
            </button>
          </div>
        )}
      </div>
    );
  },
);

DataTable.displayName = "DataTable";

export default DataTable;
