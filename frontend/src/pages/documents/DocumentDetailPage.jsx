import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { useDocuments } from "../../hooks/useDocuments";
import styles from "./DocumentDetailPage.module.css";

const currency = (value) =>
    Number(value || 0).toLocaleString("fr-FR", {
        style: "currency",
        currency: "MAD",
    });

const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getClientLabel = (client) =>
    client?.nom_entreprise || client?.nom_complet || client?.email || "—";

const formatStatut = (value) => (value ? String(value).replaceAll("_", " ") : "—");

const formatPaymentLabel = (value) => {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "paye" || normalized === "payé") return "Payé";
    if (normalized === "partiel") return "Partiel";
    if (normalized === "impaye" || normalized === "impayé") return "Impayé";
    return value || "—";
};

export default function DocumentDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        current,
        fetchOneLoading,
        fetchDocumentById,
        resetCurrent,
    } = useDocuments();

    useEffect(() => {
        if (!id) return;
        fetchDocumentById(id);

        return () => {
            resetCurrent();
        };
    }, [fetchDocumentById, id, resetCurrent]);

    const document = useMemo(() => {
        if (!current) return null;
        return String(current.id) === String(id) ? current : null;
    }, [current, id]);

    const documentLines = document?.documentLines || document?.document_lines || [];
    const documentPayments = document?.payments || [];

    return (
        <div className={styles.page}>
            <PageHeader
                title="Document"
                subtitle="Détails du document"
                actions={
                    <button className={styles.backBtn} type="button" onClick={() => navigate("/documents")}>
                        ← Retour aux documents
                    </button>
                }
            />

            <div className={styles.contentGrid}>
                <section className={styles.mainCard}>
                    {fetchOneLoading && !document ? (
                        <div className={styles.loadingState}>Chargement du document…</div>
                    ) : document ? (
                        <>
                            <div className={styles.hero}>
                                <div>
                                    <div className={styles.documentNumber}>{document.numero}</div>
                                    <div className={styles.documentMeta}>{getClientLabel(document.client)}</div>
                                </div>
                                <div className={styles.badges}>
                                    <span className={styles.typeBadge}>{document.type || "—"}</span>
                                    <span className={styles.statusBadge}>{formatStatut(document.statut)}</span>
                                </div>
                            </div>

                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryCard}>
                                    <span className={styles.summaryLabel}>Date</span>
                                    <strong className={styles.summaryValue}>{formatDate(document.date_creation)}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span className={styles.summaryLabel}>Echeance</span>
                                    <strong className={styles.summaryValue}>{formatDate(document.date_validite)}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span className={styles.summaryLabel}>HT</span>
                                    <strong className={styles.summaryValue}>{currency(document.total_ht)}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span className={styles.summaryLabel}>TVA</span>
                                    <strong className={styles.summaryValue}>{currency(document.total_tva)}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span className={styles.summaryLabel}>TTC</span>
                                    <strong className={styles.summaryValue}>{currency(document.total_ttc)}</strong>
                                </div>
                                <div className={styles.summaryCard}>
                                    <span className={styles.summaryLabel}>Reste à payer</span>
                                    <strong className={styles.summaryValue}>{currency(document.reste_a_payer)}</strong>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3>Client</h3>
                                <div className={styles.clientCard}>
                                    <div className={styles.clientAvatar}>
                                        {(document.client?.nom_complet || document.client?.nom_entreprise || "C").slice(0, 1).toUpperCase()}
                                    </div>
                                    <div className={styles.clientInfo}>
                                        <div className={styles.clientName}>{getClientLabel(document.client)}</div>
                                        <div className={styles.clientSub}>{document.client?.email || document.client?.telephone || "Client enregistré"}</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3>Lignes</h3>
                                {documentLines.length > 0 ? (
                                    <div className={styles.linesList}>
                                        {documentLines.map((line) => (
                                            <div key={line.id || `${line.product_id}-${line.ordre}`} className={styles.lineItem}>
                                                <div className={styles.lineTop}>
                                                    <div>
                                                        <div className={styles.lineTitle}>
                                                            {line.description || line.product?.nom || `Produit #${line.product_id}`}
                                                        </div>
                                                        <div className={styles.lineSub}>
                                                            Qté {line.quantite} · TVA {line.tva ?? 0}%
                                                        </div>
                                                    </div>
                                                    <div className={styles.lineAmount}>{currency(line.total_ttc)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>Aucune ligne disponible pour ce document.</div>
                                )}
                            </div>

                            <div className={styles.section}>
                                <h3>Paiements</h3>
                                {documentPayments.length > 0 ? (
                                    <div className={styles.paymentsList}>
                                        {documentPayments.map((payment) => (
                                            <div key={payment.id} className={styles.paymentItem}>
                                                <div className={styles.paymentAmount}>{currency(payment.montant)}</div>
                                                <div className={styles.paymentMeta}>
                                                    {formatDate(payment.date_paiement)} · {formatPaymentLabel(payment.statut)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>Aucun paiement associé à ce document.</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>Document introuvable.</div>
                    )}
                </section>
            </div>
        </div>
    );
}