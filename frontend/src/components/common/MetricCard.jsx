import { memo } from "react";

/**
 * MetricCard Component
 * Affiche une métrique avec icône, label et valeur
 * @param {string} label - Label du métrique
 * @param {string|number} value - Valeur à afficher
 * @param {string} sub - Sous-texte optionnel
 * @param {string} color - Couleur de bordure au hover
 * @param {ReactNode} icon - Icône (emoji ou SVG)
 */
const MetricCard = memo(
  ({ label, value, sub, color = "var(--accent)", icon }) => {
    return (
      <div
        className="metric-card"
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border)")
        }
      >
        <div className="metric-header">
          <span className="metric-icon">{icon}</span>
          <span className="metric-label">{label}</span>
        </div>
        <div className="metric-value">{value}</div>
        {sub && <div className="metric-sub">{sub}</div>}
      </div>
    );
  },
);

MetricCard.displayName = "MetricCard";

export default MetricCard;
