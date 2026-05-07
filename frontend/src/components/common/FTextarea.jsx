import { memo, forwardRef } from "react";

/**
 * FTextarea Component
 * Textarea avec label et gestion du focus
 * @param {string} label - Label optionnel
 * @param {object} props - Props HTML standard
 */
const FTextarea = memo(
  forwardRef(({ label, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <textarea className="form-input form-textarea" ref={ref} {...props} />
      </div>
    );
  }),
);

FTextarea.displayName = "FTextarea";

export default FTextarea;
