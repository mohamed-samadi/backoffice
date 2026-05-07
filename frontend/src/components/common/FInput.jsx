import { memo, forwardRef } from "react";

/**
 * FInput Component
 * Input avec label et gestion du focus
 * @param {string} label - Label optionnel
 * @param {object} props - Props HTML standard
 */
const FInput = memo(
  forwardRef(({ label, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <input className="form-input" ref={ref} {...props} />
      </div>
    );
  }),
);

FInput.displayName = "FInput";

export default FInput;
