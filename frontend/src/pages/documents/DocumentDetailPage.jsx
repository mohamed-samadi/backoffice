import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { useDocuments } from "../../hooks/useDocuments";
import DocumentForm from "./components/DocumentForm/DocumentForm";
// import GeneratePdfButton from "../../components/documents/GeneratePdfButton/GeneratePdfButton";
import styles from "./DocumentDetailPage.module.css";

export default function DocumentDetailPage({ mode = "view" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    current,
    fetchOneLoading,
    createLoading,
    updateLoading,
    fetchDocumentById,
    createDocument,
    updateDocument,
    resetCurrent,
  } = useDocuments();

  useEffect(() => {
    if (mode === "create") {
      resetCurrent();
      return undefined;
    }

    if (id) {
      fetchDocumentById(id);
    }

    return () => {
      resetCurrent();
    };
  }, [fetchDocumentById, id, mode, resetCurrent]);

  const documentData = useMemo(() => {
    if (mode === "create") return null;
    if (!current) return null;
    if (id && String(current.id) !== String(id)) return null;
    return current;
  }, [current, id, mode]);

  const title =
    mode === "create"
      ? "Créer un document"
      : mode === "edit"
        ? "Modifier le document"
        : "Détails du document";

  const subtitle =
    mode === "create"
      ? "Renseignez les informations du document et ajoutez ses lignes."
      : mode === "edit"
        ? "Modifiez le document sélectionné et ses lignes."
        : "Consultez le contenu complet du document.";

  const handleSubmit = async (payload) => {
    if (mode === "create") {
      const created = await createDocument(payload);
      navigate(`/documents/${created.id}`);
      return created;
    }

    if (!id) {
      return null;
    }

    const updated = await updateDocument(id, payload);
    navigate(`/documents/${updated.id || id}`);
    return updated;
  };

  const handleBack = () => navigate("/documents");

  const handleEdit = () => {
    if (!id) return;
    navigate(`/documents/${id}/edit`);
  };

  const handleGeneratePdf = () => {
    if (!documentData) {
      console.warn('No document data available for export');
      return;
    }

    const doc = documentData;
    const lines = doc.documentLines || doc.document_lines || [];
    const payments = doc.payments || [];

    const html = `<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Document ${doc.numero}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 24px; }
        header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
        h1 { margin:0; font-size:20px }
        table { width:100%; border-collapse: collapse; margin-top:12px }
        th, td { border: 1px solid #e5e7eb; padding:8px; text-align:left; font-size:13px }
        th { background:#f8fafc; }
        .meta { margin-top:8px; }
        .right { text-align: right }
      </style>
    </head>
    <body>
      <header>
        <div>
          <h1>${doc.numero || "Document"}</h1>
          <div class="meta">Type: ${doc.type || "—"}</div>
          <div class="meta">Client: ${doc.client?.nom_entreprise || doc.client?.nom_complet || '—'}</div>
        </div>
        <div>
          <div class="meta">Date: ${doc.date_creation || '—'}</div>
          <div class="meta">Échéance: ${doc.date_validite || '—'}</div>
        </div>
      </header>

      <section>
        <h2>Lignes</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Description</th><th>Quantité</th><th>PU HT</th><th>TVA %</th><th class="right">Total</th></tr>
          </thead>
          <tbody>
            ${lines.map((l, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${l.description || l.product?.nom || ''}</td>
                <td>${l.quantite ?? ''}</td>
                <td>${l.prix_unitaire_ht ?? ''}</td>
                <td>${l.tva ?? ''}</td>
                <td class="right">${l.total_ttc ?? ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <section style="margin-top:18px">
        <h2>Paiements</h2>
        <table>
          <thead><tr><th>Date</th><th>Montant</th><th>Statut</th></tr></thead>
          <tbody>
            ${payments.map(p => `
              <tr>
                <td>${p.date_paiement || p.created_at || ''}</td>
                <td>${p.montant ?? ''}</td>
                <td>${p.statut || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </section>

      <footer style="margin-top:20px">
        <div style="float:right; text-align:right">
          <div>Total HT: ${doc.total_ht ?? ''}</div>
          <div>Total TVA: ${doc.total_tva ?? ''}</div>
          <div><strong>Total TTC: ${doc.total_ttc ?? ''}</strong></div>
        </div>
      </footer>
    </body>
    </html>`;

    // Create a downloadable file (HTML) so the user can save/open it locally
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.numero || 'document'}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <div className={styles.headerActions}>
            <button className={styles.backBtn} type="button" onClick={handleBack}>
              ← Retour aux documents
            </button>
            {mode === "view" && documentData && (
              <>
                {/* <GeneratePdfButton document={documentData} className={styles.primaryBtn} /> */}
                <button className={styles.editBtn} type="button" onClick={handleEdit}>
                  Modifier
                </button>
              </>
            )}
          </div>
        }
      />

      <div className={styles.contentGrid}>
        <section className={styles.mainCard}>
          <DocumentForm
            mode={mode}
            initialData={documentData}
            loading={mode !== "create" && fetchOneLoading && !documentData}
            saving={createLoading || updateLoading}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            onEdit={handleEdit}
          />
        </section>
      </div>
    </div>
  );
}