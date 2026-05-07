import { memo } from "react";

/**
 * Btn Component
 * Bouton avec 5 variantes
 * @param {string} variant - Variante: primary, ghost, danger, success, custom
 * @param {string} color - Couleur pour variant custom
 * @param {ReactNode} children - Contenu du bouton
 * @param {object} props - Props HTML standard
 */
const Btn = memo(({ children, variant = "primary", color, ...props }) => {
  const variantClass = `btn btn-${variant}`;
  const style = variant === "custom" && color ? { "--btn-color": color } : {};

  return (
    <button className={variantClass} style={style} {...props}>
      {children}
    </button>
  );
});

Btn.displayName = "Btn";

export default Btn;
