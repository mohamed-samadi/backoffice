import { memo } from "react";

/**
 * Table Component
 * Tableau générique avec headers et rows
 * @param {array} headers - En-têtes du tableau
 * @param {array} rows - Lignes de données
 */
const Table = memo(({ headers, rows }) => {
  return (
    <div className="table-wrapper">
      <table className="app-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

Table.displayName = "Table";

export default Table;
