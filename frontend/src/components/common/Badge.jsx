import { memo } from "react";

/**
 * Badge Component
 * Affiche un badge coloré avec 7 variantes
 * @param {string} color - Couleur: green, red, amber, blue, purple, cyan, teal
 * @param {ReactNode} children - Contenu du badge
 */
const Badge = memo(({ color = "blue", children }) => {
  return <span className={`badge badge-${color}`}>{children}</span>;
});

Badge.displayName = "Badge";

export default Badge;
