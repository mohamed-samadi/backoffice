import Card from '../../components/common/Card';

const HomePage = () => {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--spacing-2xl)' }}>
        Tableau de Bord
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
        <Card>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>CLIENTS</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>3</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>2 actifs</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>FACTURES</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green-primary)' }}>2</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>1 impayée</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>DEVIS</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-primary)' }}>2</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>1 accepté</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 'var(--spacing-md)' }}>TÂCHES</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--red-primary)' }}>7</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>2 urgentes</div>
        </Card>
      </div>

      <Card>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--spacing-lg)' }}>
          Bienvenue! 👋
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          Vous avez accès à un système complet de gestion: clients, devis, factures, bons de livraison, tâches, dépenses, et bien plus encore.
        </p>
      </Card>
    </div>
  );
};

export default HomePage;
