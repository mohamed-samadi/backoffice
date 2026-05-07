import { memo, forwardRef } from "react";

/**
 * FSelect Component
 * Select avec label et options
 * @param {string} label - Label optionnel
 * @param {array} options - Options (string ou {label, value})
 * @param {object} props - Props HTML standard
 */
const FSelect = memo(
  forwardRef(({ label, options = [], ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <select className="form-input" ref={ref} {...props}>
          {options.map((o) =>
            typeof o === "string" ? (
              <option key={o} value={o}>
                {o}
              </option>
            ) : (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ),
          )}
        </select>
      </div>
    );
  }),
);

FSelect.displayName = "FSelect";

export default FSelect;
