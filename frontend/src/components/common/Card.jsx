const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: 'var(--bg-secondary)',
      border: `1px solid var(--border-primary)`,
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--spacing-xl)',
      ...style,
    }}
  >
    {children}
  </div>
);

export default Card;
