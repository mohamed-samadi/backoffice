import { useEffect, useMemo } from "react";
import {
  FaBell,
  FaBox,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaFileInvoice,
  FaSyncAlt,
  FaUsers,
} from "react-icons/fa";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../hooks/useDashboard";
import styles from "./HomePage.module.css";

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 });

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("fr-FR", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  });

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const getClientName = (document) =>
  document?.client?.nom_entreprise || document?.client?.nom_complet || "Client";

const CHART_COLORS = {
  accent: "#4f7fff",
  green: "#22c55e",
  amber: "#f59e0b",
  cyan: "#06b6d4",
  purple: "#a855f7",
  red: "#ef4444",
};

const chartTooltipStyle = {
  background: "#111318",
  border: "1px solid #2b3242",
  borderRadius: 8,
  color: "#f1f5f9",
};

const HomePage = () => {
  const {
    summary,
    finance,
    stock,
    tasks,
    analytics,
    recentDocuments,
    recentUsers,
    alerts,
    loading,
    error,
    fetchDashboard,
  } = useDashboard();

  useEffect(() => {
    fetchDashboard().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const revenueChartData = useMemo(
    () =>
      (analytics?.revenue_by_month || []).map((item) => ({
        name: item.label,
        total: Number(item.total || 0),
      })),
    [analytics],
  );

  const documentChartData = useMemo(() => {
    const types = analytics?.documents_by_type || {};

    return [
      { name: "Factures", value: Number(types.facture || 0), color: CHART_COLORS.green },
      { name: "Devis", value: Number(types.devis || 0), color: CHART_COLORS.accent },
      {
        name: "Bons",
        value: Number(types.bon_livraison || 0),
        color: CHART_COLORS.amber,
      },
    ];
  }, [analytics]);

  const taskChartData = useMemo(
    () => [
      { name: "A faire", total: Number(tasks?.todo || 0) },
      { name: "En cours", total: Number(tasks?.in_progress || 0) },
      { name: "Terminees", total: Number(tasks?.completed || 0) },
      { name: "En retard", total: Number(tasks?.overdue || 0) },
    ],
    [tasks],
  );

  if (loading && !summary?.clients) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <FaSyncAlt className={styles.spin} />
          Chargement du dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <FaBell />
          <div>
            <h2>Dashboard indisponible</h2>
            <p>
              {error?.message ||
                "Impossible de recuperer les indicateurs pour le moment."}
            </p>
          </div>
          <button onClick={() => fetchDashboard()}>
            <FaSyncAlt />
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Vue generale ERP</span>
          <h1>Tableau de bord</h1>
          <p>
            Pilotage commercial, stock, tresorerie, taches et utilisateurs.
          </p>
        </div>
        <button className={styles.refreshButton} onClick={() => fetchDashboard()}>
          <FaSyncAlt className={loading ? styles.spin : ""} />
          Actualiser
        </button>
      </header>

      <section className={styles.metricsGrid} aria-label="Indicateurs cles">
        <article className={styles.metricCard}>
          <span className={styles.metricIcon}>
            <FaUsers />
          </span>
          <div>
            <span className={styles.metricLabel}>Clients actifs</span>
            <strong>{formatNumber(summary?.clients?.active)}</strong>
            <small>{formatNumber(summary?.clients?.total)} clients au total</small>
          </div>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricIcon}>
            <FaFileInvoice />
          </span>
          <div>
            <span className={styles.metricLabel}>Chiffre d'affaires</span>
            <strong>{formatCurrency(finance?.documents?.chiffre_affaires)}</strong>
            <small>
              {formatCurrency(finance?.documents?.reste_a_payer)} a encaisser
            </small>
          </div>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricIcon}>
            <FaBox />
          </span>
          <div>
            <span className={styles.metricLabel}>Stock faible</span>
            <strong>{formatNumber(stock?.stock_faible)}</strong>
            <small>{formatNumber(stock?.stock_total)} unites en stock</small>
          </div>
        </article>

        <article className={styles.metricCard}>
          <span className={styles.metricIcon}>
            <FaClock />
          </span>
          <div>
            <span className={styles.metricLabel}>Taches en retard</span>
            <strong>{formatNumber(tasks?.overdue)}</strong>
            <small>{formatNumber(tasks?.urgent)} urgentes</small>
          </div>
        </article>
      </section>

      <section className={styles.alertStrip} aria-label="Alertes prioritaires">
        <div>
          <FaBell />
          <span>{formatNumber(alerts?.documents_impayes)} documents impayes</span>
        </div>
        <div>
          <FaCreditCard />
          <span>{formatNumber(alerts?.credits_en_retard)} credits en retard</span>
        </div>
        <div>
          <FaClock />
          <span>
            {formatNumber(alerts?.cheques_echeance_proche)} cheques a echeance
          </span>
        </div>
        <div>
          <FaBox />
          <span>{formatNumber(alerts?.stock_faible)} produits critiques</span>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Analytics</span>
              <h2>Revenus mensuels</h2>
            </div>
            <span className={styles.panelValue}>
              {formatCurrency(finance?.documents?.chiffre_affaires)}
            </span>
          </div>
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e2230" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  formatter={(value) => [formatCurrency(value), "Revenu"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={CHART_COLORS.accent}
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Documents</span>
              <h2>Repartition</h2>
            </div>
            <FaFileInvoice />
          </div>
          <div className={styles.pieBox}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={documentChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={3}
                >
                  {documentChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [formatNumber(value), "Total"]} />
                <Legend iconType="circle" wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>Taches</span>
            <h2>Charge operationnelle</h2>
          </div>
          <span className={styles.panelValue}>{formatNumber(tasks?.total)} taches</span>
        </div>
        <div className={styles.chartBoxSmall}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskChartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1e2230" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [formatNumber(value), "Total"]} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {taskChartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={[CHART_COLORS.accent, CHART_COLORS.cyan, CHART_COLORS.green, CHART_COLORS.red][index]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Documents recents</span>
              <h2>Flux commercial</h2>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Numero</th>
                  <th>Client</th>
                  <th>Statut</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((document) => (
                  <tr key={document.id}>
                    <td>{document.numero}</td>
                    <td>{getClientName(document)}</td>
                    <td>
                      <span className={styles.badge}>
                        {document.statut_paiement}
                      </span>
                    </td>
                    <td>{formatCurrency(document.total_ttc)}</td>
                    <td>{formatDate(document.created_at)}</td>
                  </tr>
                ))}
                {recentDocuments.length === 0 && (
                  <tr>
                    <td colSpan="5" className={styles.emptyCell}>
                      Aucun document recent.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Utilisateurs</span>
              <h2>Equipe et acces</h2>
            </div>
            <FaUsers />
          </div>
          <div className={styles.userList}>
            {recentUsers.map((user) => (
              <div className={styles.userRow} key={user.id}>
                <span className={styles.avatar}>
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
                {user.email_verified_at ? (
                  <span className={styles.verified}>
                    <FaCheckCircle />
                  </span>
                ) : (
                  <span className={styles.pending}>Invite</span>
                )}
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className={styles.emptyState}>Aucun utilisateur.</div>
            )}
          </div>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>Stock</span>
            <h2>Produits a surveiller</h2>
          </div>
          <FaBox />
        </div>
        <div className={styles.stockGrid}>
          {(stock?.low_stock || []).map((product) => (
            <article className={styles.stockItem} key={product.id}>
              <strong>{product.nom}</strong>
              <small>
                {product.category?.name || "Sans categorie"} -{" "}
                {product.fournisseur?.nom || "Sans fournisseur"}
              </small>
              <div>
                <span>{formatNumber(product.quantite_stock)} en stock</span>
                <small>Seuil {formatNumber(product.seuil_alerte_stock || 10)}</small>
              </div>
            </article>
          ))}
          {(stock?.low_stock || []).length === 0 && (
            <div className={styles.emptyState}>Aucune alerte stock.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
